"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countriesClass = void 0;
const axios_1 = __importDefault(require("axios"));
class Country {
    async getCountries(region) {
        try {
            const path = region === 'all' ? 'all' : `region/${region}`;
            let arrayCountries = null;
            const result = await axios_1.default.get(`https://restcountries.com/v3.1/${path}`);
            arrayCountries = result.data.map((i) => {
                return {
                    country: i.translations.rus.common,
                    flag: i.flag,
                };
            });
            return arrayCountries;
        }
        catch (e) {
            console.log('Error while getting CountriesAPI server response', e);
        }
    }
}
exports.countriesClass = new Country();
