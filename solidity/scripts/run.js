const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame');
    const gameContract = await gameContractFactory.deploy(
        ["Albert Einstein", "Marie Curie", "Richard Feynman", "Robert Oppenheimer"],       // Names
        ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/256px-Albert_Einstein_Head.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Portrait_of_Maria_Sk%C5%82odowska-Curie.jpg/256px-Portrait_of_Maria_Sk%C5%82odowska-Curie.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Richard_Feynman_1988.png/256px-Richard_Feynman_1988.png",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Oppenheimer.jpg/256px-Oppenheimer.jpg"],
        [500, 400, 300, 200],                    // HP values
        [100, 70, 50, 25],                       // Attack damage values
        "Atom", // Boss name
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/%D0%94%D1%96%D0%B0%D0%B3%D1%80%D0%B0%D0%BC%D0%B0_%D0%90%D1%82%D0%BE%D0%BC%D0%B0.svg/256px-%D0%94%D1%96%D0%B0%D0%B3%D1%80%D0%B0%D0%BC%D0%B0_%D0%90%D1%82%D0%BE%D0%BC%D0%B0.svg.png", // Boss image
        5000, // Boss hp
        50 // Boss attack damage
    );
    await gameContract.deployed();
    console.log("Contract deployed to:", gameContract.address);

    let txn;
    // We only have three characters.
    // an NFT w/ the character at index 2 of our array.
    txn = await gameContract.mintCharacterNFT(2);
    await txn.wait();

    // Get the value of the NFT's URI.
    let returnedTokenUri = await gameContract.tokenURI(1);
    console.log("Token URI:", returnedTokenUri);

    txn = await gameContract.attackBoss();
    await txn.wait();
    
    txn = await gameContract.attackBoss();
    await txn.wait();
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