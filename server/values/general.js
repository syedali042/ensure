const v = require('./fields').codes;
const codesF = v.fields;
module.exports.sectionsTitles = {
  user: 'Din Profil',
  leasers: 'Kunder',
  entries: 'Certifikat data',
  codes: 'Koder',
};

module.exports.functions = {
  filterCodes: (value, codes) => {
    let r;
    codes.map((code) => {
      if (
        value <= code.fields[codesF.maxValue.db] &&
        value >= code.fields[codesF.minValue.db]
      ) {
        r = code.fields[codesF.code.db];
      }
    });
    return r;
  },
};
