import Axios from 'axios';
import env from "#config/env/env.js";

export default Axios.create({
    baseURL: 'https://common-api.wildberries.ru/api/v1',
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${env.WB_API_TOKEN}`,
    },
    validateStatus: (status: number) => status >= 200 && status < 300, // Accept only 2xx responses
});
