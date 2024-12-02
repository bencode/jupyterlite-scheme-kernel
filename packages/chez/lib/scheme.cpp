#include <emscripten/bind.h>
#include <string>
#include "scheme.h"

using namespace emscripten;

struct EvalResult {
    bool success;
    std::string value;
    
    EvalResult() : success(false), value("") {}
    EvalResult(bool s, const std::string& v) : success(s), value(v) {}
};

class SchemeEvaluator {
public:
    SchemeEvaluator() {
        Sscheme_init(nullptr);
        Sbuild_heap(nullptr, nullptr);

        ptr interaction_environment = Stop_level_value(Sstring_to_symbol("interaction-environment"));
        env = Scall0(interaction_environment);
    }

    void execute(const std::string&code) {
        ptr open_input_string = Stop_level_value(Sstring_to_symbol("open-input-string"));
        ptr read = Stop_level_value(Sstring_to_symbol("read"));
        ptr eval = Stop_level_value(Sstring_to_symbol("eval"));
        ptr port = Scall1(open_input_string, Sstring(code.c_str()));
        ptr expr = Scall1(read, port);
        Scall2(eval, expr, env);
    }

    EvalResult evaluate(const std::string& code) {
        ptr open_input_string = Stop_level_value(Sstring_to_symbol("open-input-string"));
        ptr read = Stop_level_value(Sstring_to_symbol("safe-read"));
        ptr eval = Stop_level_value(Sstring_to_symbol("safe-eval"));
        ptr get_last_error = Stop_level_value(Sstring_to_symbol("get-last-error"));
        ptr write_to_string = Stop_level_value(Sstring_to_symbol("write-to-string"));

        ptr port = Scall1(open_input_string, Sstring(code.c_str()));
        ptr last_result = Sfalse;

        while (true) {
            ptr expr = Scall1(read, port);

            ptr error = Scall0(get_last_error);
            if (error != Sfalse) {
                return EvalResult(false, extract_scheme_string(error));
            }

            if (expr == Seof_object) {
                if (last_result == Sfalse) {
                    return EvalResult(true, "");
                }
                ptr result_string = Scall1(write_to_string, last_result);
                return EvalResult(true, extract_scheme_string(result_string));
            }

            last_result = Scall2(eval, expr, env);

            error = Scall0(get_last_error);
            if (error != Sfalse) {
                return EvalResult(false, extract_scheme_string(error));
            }
        }
    }

    ~SchemeEvaluator() {
        Sscheme_deinit();
    }

private:
    ptr env;

    std::string extract_scheme_string(ptr scheme_string) {
        if (!Sstringp(scheme_string)) {
            return "Invalid Scheme string";
        }
        iptr length = Sstring_length(scheme_string);
        std::string result;
        for (iptr i = 0; i < length; ++i) {
            result += (char)Sstring_ref(scheme_string, i);
        }
        return result;
    }
};

EMSCRIPTEN_BINDINGS(scheme_eval) {
   value_object<EvalResult>("EvalResult")
        .field("success", &EvalResult::success)
        .field("value", &EvalResult::value);

    class_<SchemeEvaluator>("SchemeEvaluator")
        .constructor<>()
        .function("execute", &SchemeEvaluator::execute)
        .function("evaluate", &SchemeEvaluator::evaluate);
}
