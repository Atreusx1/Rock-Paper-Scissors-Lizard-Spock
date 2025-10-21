/**
 *  @title Rock Paper Scissors Lizard Spock
 *  @author Clément Lesaege - <clement@lesaege.com>
 */
 
/* This program is free software. It comes without any warranty, to
the extent permitted by applicable law. You can redistribute it
and/or modify it under the terms of the Do What The Fuck You Want
To Public License, Version 2, as published by Sam Hocevar. See
http://www.wtfpl.net/ for more details. */

pragma solidity ^0.8.28;

contract RPS{
    address public j1; // The first player creating the contract.
    address public j2; // The second player.
    enum Move {Null, Rock, Paper, Scissors, Spock, Lizard} // Possible moves. Note that if the parity of the moves is the same the lower one wins, otherwise the higher one. 
    bytes32 public c1Hash; // Commitment of j1.
    Move public c2; // Move of j2. Move.Null before he played.
    uint256 public stake; // Amout bet by each party. 
    uint256 public TIMEOUT = 5 minutes; // If some party takes more than TIMEOUT to respond, the other can call TIMEOUT to win.
    uint256 public lastAction; // The time of the last action. Usefull to determine if someone has timed out.
    
  /** @dev Constructor. Must send the amount at stake when creating the contract. Note that the move and salt must be saved.
     *  @param _c1Hash Must be equal to keccak256(c1,salt) where c1 is the move of the j1.
     */
    constructor(bytes32 _c1Hash, address _j2) payable { 
        // earlier it was: function RPS(bytes32 _c1Hash, address _j2) payable {
        // i changed this to constructor since newer solidity uses constructor instead of having same name as contract
        stake = msg.value; // La mise correspond à la quantité d'ethers envoyés.
        j1 = msg.sender;
        j2 = _j2;
        c1Hash = _c1Hash;
        lastAction = block.timestamp; 
        // earlier it was: lastAction = now;
        // now is removed in 0.8.x 
    }
    
    /** @dev To be called by j2 and provided stake.
     *  @param _c2 The move submitted by j2.
     */
    function play(Move _c2) external payable { 
        // earlier it was: function play(Move _c2) payable {
        // made it external coz solidity 0.8.x wants explicit visibility
        require(c2 == Move.Null); // j2 not played yet
        require(_c2 != Move.Null); // A move is selected.
        require(msg.value == stake); // J2 has paid the stake.
        require(msg.sender == j2); // Only j2 can call this function.
            
        c2 = _c2;
        lastAction = block.timestamp; 
        // earlier it was: lastAction = now;
    }
    
    /** @dev To be called by j1. Reveal the move and send the ETH to the winning party or split them.
     *  @param _c1 The move played by j1.
     *  @param _salt The salt used when submitting the commitment when the constructor was called.
     */
    function solve(Move _c1, uint256 _salt) external { 
        // earlier it was: function solve(Move _c1, uint256 _salt) {
        // added external and fixed keccak line
        require(_c1 != Move.Null); // J1 should have made a valid move.
        require(c2 != Move.Null); // J2 must have played.
        require(msg.sender == j1); // J1 can call this.
        require(keccak256(abi.encodePacked(_c1, _salt)) == c1Hash); // Verify the value is the commited one.
        // earlier it was: keccak256(_c1,_salt)
        // old syntax gave error cause keccak256 needs bytes now


        // If j1 or j2 throws at fallback it won't get funds and that is his fault.
        // Despite what the warnings say, we should not use transfer as a throwing fallback would be able to block the contract, in case of tie.
        if (win(_c1, c2))
            payable(j1).transfer(2 * stake);
            // earlier it was: j1.send(2*stake);
            // send() not used anymore, better use transfer for safety
        else if (win(c2, _c1))
            payable(j2).transfer(2 * stake);
            // earlier it was: j2.send(2*stake);
        else {
            payable(j1).transfer(stake);
            // earlier it was: j1.send(stake);
            payable(j2).transfer(stake);
            // earlier it was: j2.send(stake);
        }
        stake = 0;
    }
    
    /** @dev Let j2 get the funds back if j1 did not play.
     */
    function j1Timeout() external { 
        // earlier it was: function j1Timeout() {
        // added external again, compiler needs it
        require(c2 != Move.Null); // J2 already played.
        require(block.timestamp > lastAction + TIMEOUT); // Timeout time has passed.
        // earlier it was: now > lastAction + TIMEOUT
        payable(j2).transfer(2 * stake);
        // earlier it was: j2.send(2*stake)
        stake = 0;
    }
    
    /** @dev Let j1 take back the funds if j2 never play.
     */
    function j2Timeout() external { 
        // earlier it was: function j2Timeout() {
        require(c2 == Move.Null); // J2 has not played.
        require(block.timestamp > lastAction + TIMEOUT); // Timeout time has passed
        // earlier it was: now > lastAction + TIMEOUT
        payable(j1).transfer(stake);
        // earlier it was: j1.send(stake);
        stake = 0;
    }
    
    /** @dev Is this move winning over the other.
     *  @param _c1 The first move.
     *  @param _c2 The move the first move is considered again.
     *  @return w True if c1 beats c2. False if c1 is beaten by c2 or in case of tie.
     */
    function win(Move _c1, Move _c2) public pure returns (bool w) { 
        // earlier it was: function win(Move _c1, Move _c2) public const returns (bool w)
        // "const" not valid anymore, changed to pure. pure is same idea (doesn’t modify or read blockchain)
        if (_c1 == _c2)
            return false; // They played the same so no winner.
        else if (_c1 == Move.Null) 
            return false; // They did not play.
        else if (uint(_c1) % 2 == uint(_c2) % 2) 
            return (_c1 < _c2);
        else
            return (_c1 > _c2);
    }
}

contract Hasher{
    /** @dev Give the commitement. Must only be called locally.
     *  @param _c The move.
     *  @param _salt The salt to increase entropy.
     */
    function hash(uint8 _c, uint256 _salt) public pure returns(bytes32) { 
        // earlier it was:  public const returns(bytes32)
        // same reason, const is gone now
        return keccak256(abi.encodePacked(_c, _salt)); 
        // earlier it was: keccak256(_c,_salt)
        // had to use  abi.encodePacked to combine values properly for hashing
    }
}