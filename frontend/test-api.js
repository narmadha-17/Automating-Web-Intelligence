import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

async function testConnection() {
    console.log('Testing connection to backend...');
    try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        console.log('Backend is reachable:', response.data);
    } catch (error) {
        console.error('Backend is unreachable. Make sure FastAPI is running on port 8000.');
        console.error('Error:', error.message);
    }
}

testConnection();
