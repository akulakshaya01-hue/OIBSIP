const temperatureInput = document.getElementById("temperature");
const unitSelect = document.getElementById("unit");
const convertButton = document.getElementById("convert-btn");

const errorMessage = document.getElementById("error-message");

const celsiusResult = document.getElementById("celsius-result");
const fahrenheitResult = document.getElementById("fahrenheit-result");
const kelvinResult = document.getElementById("kelvin-result");

function formatTemperature(value) {
    return Number(value.toFixed(2));
}

function showError(message) {
    errorMessage.textContent = message;

    celsiusResult.textContent = "—";
    fahrenheitResult.textContent = "—";
    kelvinResult.textContent = "—";
}

function clearError() {
    errorMessage.textContent = "";
}

function convertTemperature() {
    const value = Number(temperatureInput.value);
    const unit = unitSelect.value;

    // Check for empty or invalid input
    if (temperatureInput.value.trim() === "" || !Number.isFinite(value)) {
        showError("Please enter a valid temperature.");
        return;
    }

    let celsius;
    let fahrenheit;
    let kelvin;

    // Convert the entered value to Celsius first
    if (unit === "C") {
        celsius = value;
    } else if (unit === "F") {
        celsius = (value - 32) * 5 / 9;
    } else if (unit === "K") {
        celsius = value - 273.15;
    }

    // Absolute zero validation
    if (celsius < -273.15) {
        showError(
            "That temperature is below absolute zero. Please enter a valid temperature."
        );
        return;
    }

    // Convert Celsius to the other units
    fahrenheit = (celsius * 9 / 5) + 32;
    kelvin = celsius + 273.15;

    clearError();

    // Display results
    celsiusResult.textContent = formatTemperature(celsius);
    fahrenheitResult.textContent = formatTemperature(fahrenheit);
    kelvinResult.textContent = formatTemperature(kelvin);
}

// Convert when button is clicked
convertButton.addEventListener("click", convertTemperature);

// Allow Enter key to convert
temperatureInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        convertTemperature();
    }
});