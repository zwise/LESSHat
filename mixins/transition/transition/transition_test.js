var transition = require('./transition.js');


describe('transition', function(){
    it('should pass test #1', function(){
        transition('2s linear left').should.equal('2s linear left');
    });
});
