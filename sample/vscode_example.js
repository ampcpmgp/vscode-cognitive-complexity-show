function test3() {
  function test4() {
    if (3) return 4;
  }

  return test4();
}
test3();

(() => {
  function test3() {
    function test4() {
      if (3) return 4;
    }

    if ((4 && 1) || 2 || (12 && 1)) return 4;

    return test4();
  }
  test3();
})();
