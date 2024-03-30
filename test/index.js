const { default: axios } = require("axios");

async function main() {
    const User = await axios.post('http://localhost:3000/api/codes/redeem', {
        code: 'hello',
        userId: 1,
        reward: '10',
        limit: 10,
    });

    console.log(User);
};

main()