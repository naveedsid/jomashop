function randomDelay(min, max) {
    let randomDelayNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, randomDelayNum));
  }
  
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  module.exports = { randomDelay, delay};