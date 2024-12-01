#include <emscripten/bind.h>
#include <string>
#include "scheme.h"

using namespace emscripten;

class SchemeEvaluator {
public:
    SchemeEvaluator() {
        Sscheme_init(nullptr);
        Sbuild_heap(nullptr, nullptr);

        ptr interaction_environment = Stop_level_value(Sstring_to_symbol("interaction-environment"));
        env = Scall0(interaction_environment);

        _evaluate("(define (write-to-string value) (with-output-to-string (lambda () (write value))))");
    }

    ptr _evaluate(const std::string& code) {
        ptr open_input_string = Stop_level_value(Sstring_to_symbol("open-input-string"));
        ptr read = Stop_level_value(Sstring_to_symbol("read"));
        ptr eval = Stop_level_value(Sstring_to_symbol("eval"));

        ptr port = Scall1(open_input_string, Sstring(code.c_str()));
        ptr expr = Scall1(read, port);

        return Scall2(eval, expr, env);
    }

    std::string evaluate(const std::string& code) {
        ptr result = _evaluate(code);
        ptr write_to_string = Stop_level_value(Sstring_to_symbol("write-to-string"));
        ptr result_string = Scall1(write_to_string, result);
        return extract_scheme_string(result_string);
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
    class_<SchemeEvaluator>("SchemeEvaluator")
        .constructor<>()
        .function("evaluate", &SchemeEvaluator::evaluate);
}
