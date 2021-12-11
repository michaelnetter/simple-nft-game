const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame');
    const gameContract = await gameContractFactory.deploy(
        ["Albert Einstein", "Marie Curie", "Richard Feynman", "Robert Oppenheimer"],       // Names
        ["QmWmiunLQh9MsWakf6t6fc7qBWFUHTKMLanARwF41qpUbT",
    "QmZZNQQQ2bJbLCxTxEHDTEoAP8Bq6sVEWyBTNXhzRF7Ntb","QmTwGLmeSMCUC4HNmEVyUSWySP7BXyQjvX2QGt31EkiHzU","QmczUUbMT4a4gb3crJzzB1fX24vKyoaMZJX8aXj86nXPWd"],
        [500, 400, 300, 200],                    // HP values
        [100, 70, 50, 25],                       // Attack damage values
        "Atom", // Boss name
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/%D0%94%D1%96%D0%B0%D0%B3%D1%80%D0%B0%D0%BC%D0%B0_%D0%90%D1%82%D0%BE%D0%BC%D0%B0.svg/256px-%D0%94%D1%96%D0%B0%D0%B3%D1%80%D0%B0%D0%BC%D0%B0_%D0%90%D1%82%D0%BE%D0%BC%D0%B0.svg.png", // Boss image
        5000, // Boss hp
        50 // Boss attack damage
    );
    await gameContract.deployed();
    console.log("Contract deployed to:", gameContract.address);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();