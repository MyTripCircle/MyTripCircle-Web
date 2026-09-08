import { parseBarcode } from '../ticketBarcodeParser';

// Carte d'embarquement IATA BCBP : PNR ABC123, CDG → JFK, vol AF83, jour julien 226
const BCBP_SAMPLE = 'M1DOE/JOHN            EABC123 CDGJFKAF 00083226Y028A0029 100';

describe('parseBarcode', () => {
  beforeAll(() => {
    // La date julienne est relative à l'année courante : on fige l'horloge.
    jest.useFakeTimers().setSystemTime(new Date('2026-03-01T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should extract flight data when the payload is a BCBP boarding pass', () => {
    // Act
    const result = parseBarcode(BCBP_SAMPLE);

    // Assert
    expect(result.type).toBe('flight');
    expect(result.title).toBe('CDG → JFK · AF83');
    expect(result.confirmationNumber).toBe('ABC123');
    expect(result.date?.getMonth()).toBe(7);
    expect(result.date?.getDate()).toBe(14);
  });

  it('should extract the ISO date and time when the payload is generic text', () => {
    const result = parseBarcode('BILLET 2026-07-14 08:45');

    expect(result.date?.toISOString().startsWith('2026-07-14')).toBe(true);
    expect(result.time).toBe('08:45');
  });

  it('should detect a train journey when the payload mentions a route and a rail keyword', () => {
    const result = parseBarcode('TGV PARIS > LYON 14/07/2026');

    expect(result.type).toBe('train');
    // Le libellé reprend tout le texte en capitales avant la flèche, préfixe inclus.
    expect(result.title).toBe('TGV PARIS → LYON');
    expect(result.date?.getFullYear()).toBe(2026);
  });

  it('should return an empty result when the payload carries no known pattern', () => {
    const result = parseBarcode('...');

    expect(result).toEqual({});
  });
});
