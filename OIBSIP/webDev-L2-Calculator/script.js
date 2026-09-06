/* =========================================
   CALCURA
   Modern Calculator
========================================= */


/* =========================================
   DOM ELEMENTS
========================================= */

const previousDisplay =
    document.getElementById("previous-display");

const currentDisplay =
    document.getElementById("current-display");

const themeToggle =
    document.getElementById("theme-toggle");

const historyList =
    document.getElementById("history-list");

const clearHistoryButton =
    document.getElementById("clear-history");


/* =========================================
   CALCULATOR STATE
========================================= */

let currentInput = "";

let expression = "";

let currentIsPercentage = false;

let justCalculated = false;


/* =========================================
   STORAGE KEYS
========================================= */

const THEME_KEY = "calcura-theme";

const HISTORY_KEY = "calcura-history";


/* =========================================
   FORMAT NUMBER
========================================= */

function formatNumber(value) {

    if (value === null || value === undefined) {
        return "0";
    }

    const stringValue = String(value);

    if (
        stringValue === "Error" ||
        stringValue === "Infinity" ||
        stringValue === "-Infinity"
    ) {
        return stringValue;
    }

    if (
        stringValue.includes("e") ||
        stringValue.includes("E")
    ) {
        return stringValue;
    }

    const negative =
        stringValue.startsWith("-");

    const cleanValue =
        negative
            ? stringValue.slice(1)
            : stringValue;

    const parts =
        cleanValue.split(".");

    const integerPart =
        parts[0] || "0";

    const decimalPart =
        parts.length > 1
            ? "." + parts[1]
            : "";

    const formattedInteger =
        Number(integerPart).toLocaleString("en-US");

    return (
        negative ? "-" : ""
    ) +
    formattedInteger +
    decimalPart;
}


/* =========================================
   REMOVE COMMAS
========================================= */

function removeCommas(value) {

    return String(value).replace(/,/g, "");
}


/* =========================================
   FORMAT EXPRESSION FOR DISPLAY
========================================= */

function formatExpression(value) {

    if (!value) {
        return "";
    }

    return value
        .replace(/\*/g, " × ")
        .replace(/\//g, " ÷ ")
        .replace(/\+/g, " + ")
        .replace(/-/g, " − ")
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================================
   UPDATE DISPLAY
========================================= */

function updateDisplay() {

    if (currentInput === "") {

        currentDisplay.textContent = "0";

    } else if (currentIsPercentage) {

        currentDisplay.textContent =
            formatNumber(currentInput) + "%";

    } else {

        currentDisplay.textContent =
            formatNumber(currentInput);
    }


    previousDisplay.textContent =
        formatExpression(expression);
}


/* =========================================
   ADD NUMBER
========================================= */

function addNumber(number) {

    if (justCalculated) {

        currentInput = "";

        expression = "";

        currentIsPercentage = false;

        justCalculated = false;
    }


    if (currentIsPercentage) {

        currentInput = "";

        currentIsPercentage = false;
    }


    if (number === "0" && currentInput === "0") {

        return;
    }


    if (
        currentInput === "0" &&
        number !== "."
    ) {

        currentInput = number;

    } else {

        currentInput += number;
    }


    updateDisplay();
}


/* =========================================
   ADD DECIMAL
========================================= */

function addDecimal() {

    if (justCalculated) {

        currentInput = "";

        expression = "";

        currentIsPercentage = false;

        justCalculated = false;
    }


    if (currentIsPercentage) {

        return;
    }


    if (currentInput === "") {

        currentInput = "0.";
    }

    else if (
        !currentInput.includes(".")
    ) {

        currentInput += ".";
    }


    updateDisplay();
}


/* =========================================
   CHOOSE OPERATOR
========================================= */

function chooseOperator(operator) {

    if (currentInput === "") {

        if (expression !== "") {

            expression =
                expression.replace(
                    /[+\-*/]\s*$/,
                    operator
                );

            updateDisplay();
        }

        return;
    }


    if (justCalculated) {

        const result =
            removeCommas(currentInput);

        expression =
            result + operator;

        currentInput = "";

        currentIsPercentage = false;

        justCalculated = false;

        updateDisplay();

        return;
    }


    if (currentIsPercentage) {

        expression +=
            currentInput + "%";

        currentInput = "";

        currentIsPercentage = false;

    } else {

        expression += currentInput;

        currentInput = "";
    }


    expression += operator;

    updateDisplay();
}


/* =========================================
   PERCENT
========================================= */

function handlePercent() {

    if (currentInput === "") {
        return;
    }


    if (justCalculated) {

        const value =
            Number(removeCommas(currentInput));

        if (!Number.isFinite(value)) {
            return;
        }

        currentInput =
            String(value / 100);

        currentIsPercentage = true;

        justCalculated = false;

        updateDisplay();

        return;
    }


    if (currentIsPercentage) {
        return;
    }


    currentIsPercentage = true;

    updateDisplay();
}


/* =========================================
   TOKENIZE EXPRESSION
========================================= */

function tokenize(input) {

    const tokens = [];

    let number = "";

    for (let i = 0; i < input.length; i++) {

        const char = input[i];


        if (
            /[0-9.]/.test(char) ||
            (
                char === "-" &&
                (
                    i === 0 ||
                    "+-*/".includes(input[i - 1])
                )
            )
        ) {

            number += char;

        } else if (
            "+-*/".includes(char)
        ) {

            if (number !== "") {

                tokens.push(number);

                number = "";
            }

            tokens.push(char);
        }
    }


    if (number !== "") {

        tokens.push(number);
    }


    return tokens;
}


/* =========================================
   CONVERT PERCENTAGE EXPRESSIONS
========================================= */

function convertPercentages(input) {

    let result = input;

    /*
        Convert percentages based on calculator context.

        Examples:

        5%              -> 0.05

        5% + 8%         -> 0.05 + 0.08

        12 + 5%         -> 12 + 0.6

        100 + 10%       -> 100 + 10

        50 - 10%        -> 50 - 5

        50 * 20%        -> 50 * 0.20

        50 / 20%        -> 50 / 0.20
    */


    const tokens =
        result.match(
            /-?\d*\.?\d+%|[+\-*/]|-?\d*\.?\d+/g
        );


    if (!tokens) {
        return result;
    }


    const converted = [];


    for (let i = 0; i < tokens.length; i++) {

        const token = tokens[i];


        if (!token.endsWith("%")) {

            converted.push(token);

            continue;
        }


        const percentage =
            Number(
                token.slice(0, -1)
            );


        const previousToken =
            converted.length > 0
                ? converted[converted.length - 1]
                : null;


        const previousPreviousToken =
            converted.length > 1
                ? converted[converted.length - 2]
                : null;


        if (
            previousToken &&
            !"+-*/".includes(previousToken)
        ) {

            const base =
                Number(previousToken);


            if (
                Number.isFinite(base) &&
                (
                    previousPreviousToken === "+" ||
                    previousPreviousToken === "-"
                )
            ) {

                const value =
                    base * percentage / 100;

                converted.push(
                    String(value)
                );

            } else {

                converted.push(
                    String(percentage / 100)
                );
            }

        } else {

            converted.push(
                String(percentage / 100)
            );
        }
    }


    return converted.join("");
}


/* =========================================
   BASIC EXPRESSION EVALUATOR
   No eval()
========================================= */

function evaluateExpression(input) {

    let tokens =
        tokenize(input);


    if (tokens.length === 0) {

        return null;
    }


    /*
        First pass:
        multiplication and division
    */

    let values = [];

    let operators = [];


    values.push(
        Number(tokens[0])
    );


    for (
        let i = 1;
        i < tokens.length;
        i += 2
    ) {

        const operator = tokens[i];

        const nextNumber =
            Number(tokens[i + 1]);


        if (
            !Number.isFinite(nextNumber)
        ) {

            return null;
        }


        if (
            operator === "*" ||
            operator === "/"
        ) {

            const previous =
                values[values.length - 1];


            if (
                operator === "/" &&
                nextNumber === 0
            ) {

                return null;
            }


            const calculated =
                operator === "*"
                    ? previous * nextNumber
                    : previous / nextNumber;


            values[
                values.length - 1
            ] = calculated;

        } else {

            operators.push(operator);

            values.push(nextNumber);
        }
    }


    /*
        Second pass:
        addition and subtraction
    */

    let result = values[0];


    for (
        let i = 0;
        i < operators.length;
        i++
    ) {

        if (operators[i] === "+") {

            result += values[i + 1];

        } else if (operators[i] === "-") {

            result -= values[i + 1];
        }
    }


    if (!Number.isFinite(result)) {

        return null;
    }


    /*
        Remove floating point noise.
    */

    result =
        Number(
            result.toPrecision(12)
        );


    return result;
}


/* =========================================
   CALCULATE
========================================= */

function calculate() {

    if (
        currentInput === "" &&
        expression === ""
    ) {

        return;
    }


    let fullExpression =
        expression;


    if (currentInput !== "") {

        if (currentIsPercentage) {

            fullExpression +=
                currentInput + "%";

        } else {

            fullExpression +=
                currentInput;
        }
    }


    if (
        !fullExpression ||
        !/[0-9]/.test(fullExpression)
    ) {

        return;
    }


    /*
        Don't calculate if expression
        ends with an operator.
    */

    if (
        /[+\-*/]$/.test(fullExpression)
    ) {

        return;
    }


    const displayExpression =
        formatExpression(
            fullExpression
        );


    /*
        Handle percentage expressions
        separately.
    */

    const convertedExpression =
        convertPercentages(
            fullExpression
        );


    const result =
        evaluateExpression(
            convertedExpression
        );


    if (result === null) {

        previousDisplay.textContent =
            "Error: Cannot divide by zero";

        currentDisplay.textContent =
            "Error";

        currentInput = "";

        expression = "";

        currentIsPercentage = false;

        justCalculated = true;

        return;
    }


    /*
        Store history.
    */

    addToHistory(
        displayExpression,
        result
    );


    /*
        Show previous expression.
    */

    previousDisplay.textContent =
        displayExpression + " =";


    /*
        Show result.
    */

    currentInput =
        String(result);

    expression = "";

    currentIsPercentage = false;

    justCalculated = true;


    updateCurrentDisplayOnly();
}


/* =========================================
   UPDATE CURRENT DISPLAY ONLY
========================================= */

function updateCurrentDisplayOnly() {

    currentDisplay.textContent =
        formatNumber(currentInput);
}


/* =========================================
   BACKSPACE
========================================= */

function backspace() {

    /*
        After calculation:
        127 -> 12 -> 1 -> 0
    */

    if (justCalculated) {

        if (
            currentInput.length > 1
        ) {

            currentInput =
                currentInput.slice(0, -1);

        } else {

            currentInput = "0";
        }


        justCalculated = false;

        previousDisplay.textContent = "";

        updateCurrentDisplayOnly();

        return;
    }


    if (currentIsPercentage) {

        currentIsPercentage = false;

        updateDisplay();

        return;
    }


    if (currentInput !== "") {

        currentInput =
            currentInput.slice(0, -1);
    }


    updateDisplay();
}


/* =========================================
   CLEAR
========================================= */

function clearCalculator() {

    currentInput = "";

    expression = "";

    currentIsPercentage = false;

    justCalculated = false;

    previousDisplay.textContent = "";

    currentDisplay.textContent = "0";
}


/* =========================================
   HISTORY
========================================= */

function getHistory() {

    try {

        const stored =
            localStorage.getItem(
                HISTORY_KEY
            );


        if (!stored) {

            return [];
        }


        const history =
            JSON.parse(stored);


        return Array.isArray(history)
            ? history
            : [];

    } catch (error) {

        return [];
    }
}


/* =========================================
   SAVE HISTORY
========================================= */

function saveHistory(history) {

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );
}


/* =========================================
   ADD HISTORY ITEM
========================================= */

function addToHistory(
    calculation,
    result
) {

    const history =
        getHistory();


    history.unshift({

        expression: calculation,

        result: String(result),

        timestamp: Date.now()

    });


    /*
        Keep latest 20 calculations.
    */

    const limitedHistory =
        history.slice(0, 20);


    saveHistory(
        limitedHistory
    );


    renderHistory();
}


/* =========================================
   RENDER HISTORY
========================================= */

function renderHistory() {

    const history =
        getHistory();


    historyList.innerHTML = "";


    if (history.length === 0) {

        const empty =
            document.createElement("p");

        empty.className =
            "history-empty";

        empty.textContent =
            "No calculations yet.";

        historyList.appendChild(empty);

        return;
    }


    history.forEach(
        (item) => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "history-item";


            const expression =
                document.createElement("span");

            expression.className =
                "history-expression";

            expression.textContent =
                item.expression;


            const result =
                document.createElement("span");

            result.className =
                "history-result";

            result.textContent =
                formatNumber(item.result);


            button.appendChild(
                expression
            );

            button.appendChild(
                result
            );


            /*
                Clicking a history result
                loads it into calculator.
            */

            button.addEventListener(
                "click",
                () => {

                    currentInput =
                        item.result;

                    expression = "";

                    currentIsPercentage =
                        false;

                    justCalculated =
                        false;

                    previousDisplay.textContent =
                        item.expression + " =";

                    updateCurrentDisplayOnly();
                }
            );


            historyList.appendChild(
                button
            );
        }
    );
}


/* =========================================
   CLEAR HISTORY
========================================= */

function clearHistory() {

    localStorage.removeItem(
        HISTORY_KEY
    );

    renderHistory();
}


/* =========================================
   THEME
========================================= */

function applyTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add(
            "dark-theme"
        );

        themeToggle.textContent =
            "☀️";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to light mode"
        );

    } else {

        document.body.classList.remove(
            "dark-theme"
        );

        themeToggle.textContent =
            "🌙";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to dark mode"
        );
    }
}


/* =========================================
   LOAD SAVED THEME
========================================= */

const savedTheme =
    localStorage.getItem(
        THEME_KEY
    );


applyTheme(
    savedTheme || "light"
);


/* =========================================
   THEME TOGGLE
========================================= */

themeToggle.addEventListener(
    "click",
    () => {

        const isDark =
            document.body.classList.contains(
                "dark-theme"
            );


        const newTheme =
            isDark
                ? "light"
                : "dark";


        applyTheme(
            newTheme
        );


        localStorage.setItem(
            THEME_KEY,
            newTheme
        );
    }
);


/* =========================================
   BUTTON EVENTS
========================================= */

document
    .querySelectorAll("[data-number]")
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    addNumber(
                        button.dataset.number
                    );
                }
            );
        }
    );


document
    .querySelectorAll("[data-operator]")
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    chooseOperator(
                        button.dataset.operator
                    );
                }
            );
        }
    );


document
    .querySelectorAll("[data-action]")
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;


                    if (
                        action === "clear"
                    ) {

                        clearCalculator();

                    } else if (
                        action === "backspace"
                    ) {

                        backspace();

                    } else if (
                        action === "percent"
                    ) {

                        handlePercent();

                    } else if (
                        action === "decimal"
                    ) {

                        addDecimal();

                    } else if (
                        action === "equals"
                    ) {

                        calculate();
                    }
                }
            );
        }
    );


/* =========================================
   CLEAR HISTORY EVENT
========================================= */

clearHistoryButton.addEventListener(
    "click",
    clearHistory
);


/* =========================================
   KEYBOARD SUPPORT
========================================= */

document.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key;


        /*
            Numbers
        */

        if (/^[0-9]$/.test(key)) {

            addNumber(key);

            return;
        }


        /*
            Decimal
        */

        if (key === ".") {

            addDecimal();

            return;
        }


        /*
            Operators
        */

        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/"
        ) {

            chooseOperator(key);

            return;
        }


        /*
            Percentage
        */

        if (key === "%") {

            handlePercent();

            return;
        }


        /*
            Enter / =
        */

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

            return;
        }


        /*
            Backspace
        */

        if (key === "Backspace") {

            event.preventDefault();

            backspace();

            return;
        }


        /*
            Escape = AC
        */

        if (key === "Escape") {

            clearCalculator();
        }
    }
);


/* =========================================
   INITIALIZE HISTORY
========================================= */

renderHistory();

updateDisplay();