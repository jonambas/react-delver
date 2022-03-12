"use strict";
exports.__esModule = true;
var index_1 = require("../index");
describe('parse', function () {
    describe('inclusion', function () {
        it('includes sub components', function () {
            var result = (0, index_1["default"])(['./tests/inclusion.jsx'], { ignoreSubComponents: false });
            expect(result[0].name).toBe('Foo');
            expect(result[0].count).toBe(2);
            expect(result[1].name).toBe('Foo.Bar');
            expect(result[1].count).toBe(1);
        });
        it('ignores sub components', function () {
            var result = (0, index_1["default"])(['./tests/inclusion.jsx'], { ignoreSubComponents: true });
            expect(result[0].name).toBe('Foo');
            expect(result[0].count).toBe(2);
            expect(result.length).toBe(2);
        });
        it('includes only specified packages', function () {
            var result = (0, index_1["default"])(['./tests/inclusion.jsx'], { from: ['package/b'] });
            expect(result[0].name).toBe('Baz');
            expect(result[0].count).toBe(1);
        });
    });
    describe('prop parser', function () {
        it('finds strings', function () {
            var result = (0, index_1["default"])(['./tests/props.jsx'], {});
            var props = result[0].instances[0].props || [];
            expect(props[0].name).toBe('string');
            expect(props[0].value).toBe('string');
        });
        it('finds booleans', function () {
            var result = (0, index_1["default"])(['./tests/props.jsx'], {});
            var props = result[0].instances[0].props || [];
            expect(props[1].name).toBe('implicitTrue');
            expect(props[1].value).toBe(true);
            expect(props[2].name).toBe('false');
            expect(props[2].value).toBe(false);
        });
        it('finds expressions', function () {
            var result = (0, index_1["default"])(['./tests/props.jsx'], {});
            var props = result[0].instances[0].props || [];
            expect(props[3].name).toBe('expression');
            expect(props[3].value).toBe('() => ({})');
            expect(props[4].name).toBe('number');
            expect(props[4].value).toBe('1');
        });
    });
    describe('raw processing', function () {
        it('bypasses processing', function () {
            var result = (0, index_1["default"])(['./tests/inclusion.jsx'], { raw: true });
            expect(result.length).toBe(4);
            expect(result[0].name).toBe('Foo');
            expect(result[0].count).toBe(undefined);
        });
    });
});
