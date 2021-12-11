// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// Inherit from ERC721
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// OpenZeppelin helpers
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Helper we wrote to encode in Base64
import "./libraries/Base64.sol";

import "hardhat/console.sol";

contract MyEpicGame is ERC721 {
    // Define character attributes
    struct CharacterAttributes {
        uint256 characterIndex;
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
    }

    // Define a token identifier
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Map tokenId to character attributes
    mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

    // Map owner to tokenId
    mapping(address => uint256) public nftHolders;

    // Define boss attributes
    struct BigBoss {
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
    }

    BigBoss public bigBoss;

    // Array to store default data of characters
    CharacterAttributes[] defaultCharacters;

    event CharacterNFTMinted(
        address sender,
        uint256 tokenId,
        uint256 characterIndex
    );
    event AttackComplete(uint256 newBossHp, uint256 newPlayerHp);

    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint256[] memory characterHp,
        uint256[] memory characterAttackDmg,
        string memory bossName, // These new variables would be passed in via run.js or deploy.js.
        string memory bossImageURI,
        uint256 bossHp,
        uint256 bossAttackDamage
    ) ERC721("SmartScientistsNFT", "SCIENCENFT") {
        // Initialize the boss and save it to a variable
        bigBoss = BigBoss({
            name: bossName,
            imageURI: bossImageURI,
            hp: bossHp,
            maxHp: bossHp,
            attackDamage: bossAttackDamage
        });

        // Loop through all the characters, and save their values in our contract so
        // we can use them later when we mint our NFTs.
        for (uint256 i = 0; i < characterNames.length; i += 1) {
            defaultCharacters.push(
                CharacterAttributes({
                    characterIndex: i,
                    name: characterNames[i],
                    imageURI: characterImageURIs[i],
                    hp: characterHp[i],
                    maxHp: characterHp[i],
                    attackDamage: characterAttackDmg[i]
                })
            );

            CharacterAttributes memory c = defaultCharacters[i];
            console.log(
                "Done initializing %s w/ HP %s, img %s",
                c.name,
                c.hp,
                c.imageURI
            );
        }

        // Increment tokenId so that the first NFT has an ID of 1.
        _tokenIds.increment();
    }

    /*
     * Mints a new NFT using _characterIndex to choose from one of the three available characters
     */
    function mintCharacterNFT(uint256 _characterIndex) external {
        // Get current Id
        uint256 newItemId = _tokenIds.current();

        // Mint token
        _safeMint(msg.sender, newItemId);

        // Map tokenId to character attributes
        nftHolderAttributes[newItemId] = CharacterAttributes({
            characterIndex: _characterIndex,
            name: defaultCharacters[_characterIndex].name,
            imageURI: defaultCharacters[_characterIndex].imageURI,
            hp: defaultCharacters[_characterIndex].hp,
            maxHp: defaultCharacters[_characterIndex].maxHp,
            attackDamage: defaultCharacters[_characterIndex].attackDamage
        });

        console.log(
            "Minted NFT w/ tokenId %s and characterIndex %s (Name: %s)",
            newItemId,
            _characterIndex,
            defaultCharacters[_characterIndex].name
        );

        // Store who owns the NFT
        nftHolders[msg.sender] = newItemId;

        // Increment the tokenId
        _tokenIds.increment();

        // Emit event
        emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
    }

    /*
     * Create a base64-encoded token URI that contains the actual NFT data
     */
    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        // Fetch NFT data
        CharacterAttributes memory charAttributes = nftHolderAttributes[
            _tokenId
        ];

        string memory strHp = Strings.toString(charAttributes.hp);
        string memory strMaxHp = Strings.toString(charAttributes.maxHp);
        string memory strAttackDamage = Strings.toString(
            charAttributes.attackDamage
        );

        // Build a JSON
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        charAttributes.name,
                        " -- NFT #: ",
                        Strings.toString(_tokenId),
                        '", "description": "An epic battle of scientists!", "image": "ipfs://',
                        charAttributes.imageURI,
                        '", "attributes": [ { "trait_type": "Health Points", "value": ',
                        strHp,
                        ', "max_value":',
                        strMaxHp,
                        '}, { "trait_type": "Attack Damage", "value": ',
                        strAttackDamage,
                        "} ]}"
                    )
                )
            )
        );

        // Encode JSON as base64
        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    /*
     * Attack boss
     */
    function attackBoss() public {
        // Get the state of the player's NFT.
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];
        console.log(
            "\nPlayer w/ character %s about to attack. Has %s HP and %s AD",
            player.name,
            player.hp,
            player.attackDamage
        );
        console.log(
            "Boss %s has %s HP and %s AD",
            bigBoss.name,
            bigBoss.hp,
            bigBoss.attackDamage
        );

        // Make sure the player has more than 0 HP.
        require(player.hp > 0, "Error: character must have HP to attack boss.");

        // Make sure the boss has more than 0 HP.
        require(bigBoss.hp > 0, "Error: boss must have HP to attack boss.");

        // Attack boss
        if (bigBoss.hp < player.attackDamage) {
            bigBoss.hp = 0;
        } else {
            bigBoss.hp = bigBoss.hp - player.attackDamage;
        }

        // Allow player
        if (player.hp < bigBoss.attackDamage) {
            player.hp = 0;
        } else {
            player.hp = player.hp - bigBoss.attackDamage;
        }

        console.log("Player attacked boss. New boss hp: %s", bigBoss.hp);
        console.log("Boss attacked player. New player hp: %s\n", player.hp);

        // Emit event
        emit AttackComplete(bigBoss.hp, player.hp);
    }

    /*
     * Checks if user already has an NFT
     */
    function checkIfUserHasNFT()
        public
        view
        returns (CharacterAttributes memory)
    {
        // Get the tokenId of the user's character NFT
        uint256 userNftTokenId = nftHolders[msg.sender];
        // If the user has a tokenId in the map, return their character.
        if (userNftTokenId > 0) {
            return nftHolderAttributes[userNftTokenId];
        }
        // Else, return an empty character.
        else {
            CharacterAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    /*
     * Returns all default charaters
     */
    function getAllDefaultCharacters()
        public
        view
        returns (CharacterAttributes[] memory)
    {
        return defaultCharacters;
    }

    /*
     * Returns the boss
     */
    function getBigBoss() public view returns (BigBoss memory) {
        return bigBoss;
    }
}
