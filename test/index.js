const { default: axios } = require("axios");

async function main() {
    const User = await axios.get('http://localhost:3000/api/users/1', {
        id: 1
    });

    console.log(User);
};

main()