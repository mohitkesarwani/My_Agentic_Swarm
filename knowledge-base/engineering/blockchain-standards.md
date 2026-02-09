# Blockchain & DeFi Standards

## Smart Contract Security
- Follow Solidity best practices (checks-effects-interactions)
- Use OpenZeppelin contracts where possible
- Implement upgrade patterns (UUPS or Transparent Proxy)
- Access control on all sensitive functions

## Security Review Checklist
- [ ] Reentrancy guards
- [ ] Integer overflow/underflow (Solidity 0.8+ default checks)
- [ ] Access control on admin functions
- [ ] Oracle manipulation resistance
- [ ] Flash loan attack vectors
- [ ] Front-running / MEV protection
- [ ] Proper event emission

## Fuzzing & Testing
- Echidna for property-based testing
- Foundry for unit and integration tests
- Invariant testing for critical state properties

## Oracle Integration
- Use multiple oracle sources
- Implement fallback mechanisms
- Add staleness checks
- Defend against manipulation

## Wallet & Key Management
- Hardware wallet support for admin operations
- Multi-sig for treasury operations
- Session key patterns for UX
- Clear signing prompts

## Monitoring
- On-chain event monitoring
- Pause mechanisms for emergencies
- Incident response runbooks
