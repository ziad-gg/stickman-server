const { default: axios } = require("axios");

async function main() {
    const User = await axios.post('http://localhost:3000/api/users', {
        id: 1
    });

    console.log(User);
};

main()