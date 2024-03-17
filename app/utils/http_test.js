const axios = require("axios");

async function fetchData() {
    try {
        // Perform the GET request using axios
        const response = await axios.get('http://93.190.139.223:8080/v1/tick-data/12050984');
        
        console.log(response.data);
    } catch (error) {
        console.error("An error occurred while fetching data:", error.message);
    }
}

// Call the fetchData function
fetchData();
