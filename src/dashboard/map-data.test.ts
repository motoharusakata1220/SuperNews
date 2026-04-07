import {
  COUNTRY_INFO,
  getCountryInfo,
  getTargetCountryCodes,
  CountryInfo,
} from './map-data';

describe('COUNTRY_INFO', () => {
  test('対象15ヶ国+EUの情報が定義されているとき全16エントリが存在する', () => {
    const codes = Object.keys(COUNTRY_INFO);
    expect(codes.length).toBeGreaterThanOrEqual(16);
  });

  test('各エントリに必須フィールドが揃っているとき型が正しい', () => {
    for (const [code, info] of Object.entries(COUNTRY_INFO)) {
      expect(info.nameJa).toBeTruthy();
      expect(info.nameEn).toBeTruthy();
      expect(typeof info.lat).toBe('number');
      expect(typeof info.lng).toBe('number');
      expect(info.region).toBeTruthy();
    }
  });

  test('日本のコードがJPNのとき日本の情報が返る', () => {
    const japan = COUNTRY_INFO['JPN'];
    expect(japan).toBeDefined();
    expect(japan.nameJa).toBe('日本');
    expect(japan.nameEn).toBe('Japan');
    expect(japan.region).toBe('アジア');
  });

  test('アメリカのコードがUSAのとき米国の情報が返る', () => {
    const usa = COUNTRY_INFO['USA'];
    expect(usa).toBeDefined();
    expect(usa.nameJa).toBe('アメリカ');
    expect(usa.nameEn).toBe('United States');
    expect(usa.region).toBe('北米');
  });
});

describe('getCountryInfo', () => {
  test('存在する国コードを指定したとき情報が返る', () => {
    const info = getCountryInfo('DEU');
    expect(info).toBeDefined();
    expect(info!.nameJa).toBe('ドイツ');
  });

  test('存在しない国コードを指定したときundefinedが返る', () => {
    const info = getCountryInfo('ZZZ');
    expect(info).toBeUndefined();
  });

  test('alpha-2コード(JP)を指定したときJPNの情報が返る', () => {
    const info = getCountryInfo('JP');
    expect(info).toBeDefined();
    expect(info!.nameJa).toBe('日本');
  });

  test('EUを指定したときEUの情報が返る', () => {
    const info = getCountryInfo('EU');
    expect(info).toBeDefined();
    expect(info!.nameJa).toBe('EU');
  });
});

describe('getTargetCountryCodes', () => {
  test('対象国コード一覧を返すとき15ヶ国+EUが含まれる', () => {
    const codes = getTargetCountryCodes();
    expect(codes).toContain('USA');
    expect(codes).toContain('JPN');
    expect(codes).toContain('CHN');
    expect(codes).toContain('EU');
    expect(codes.length).toBeGreaterThanOrEqual(16);
  });
});
