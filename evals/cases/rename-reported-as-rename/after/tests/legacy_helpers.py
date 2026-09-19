def test_legacy_doubles():
    assert legacy(1) == 2


def test_legacy_handles_zero():
    assert legacy(0) == 0
