const { default: axios } = require("axios");

async function main() {
    const User = await axios.patch('http://localhost:3000/api/users', {
        userId: 1,
        key: 'sticks',
        value: [1, 2, 3],
    });

    console.log(User);
};

main()