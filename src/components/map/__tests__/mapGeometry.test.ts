import { coordinatesToBounds, regionToZoom } from '../mapGeometry';

describe('regionToZoom', () => {
  it('should return zoom 0 when the whole world fits a 512px container', () => {
    // Arrange
    const region = { latitude: 0, longitude: 0, latitudeDelta: 180, longitudeDelta: 360 };

    // Act
    const zoom = regionToZoom(region, 512);

    // Assert
    expect(zoom).toBeCloseTo(0);
  });

  it('should gain one zoom level when the visible span is halved', () => {
    const region = { latitude: 0, longitude: 0, latitudeDelta: 90, longitudeDelta: 180 };

    const zoom = regionToZoom(region, 512);

    expect(zoom).toBeCloseTo(1);
  });

  it('should clamp the zoom to the maximum for a very small span', () => {
    const region = { latitude: 48.85, longitude: 2.35, latitudeDelta: 1e-9, longitudeDelta: 1e-9 };

    const zoom = regionToZoom(region, 1024);

    expect(zoom).toBe(20);
  });

  it('should fall back to zoom 1 when the container has no width yet', () => {
    const region = { latitude: 0, longitude: 0, latitudeDelta: 10, longitudeDelta: 10 };

    expect(regionToZoom(region, 0)).toBe(1);
  });
});

describe('coordinatesToBounds', () => {
  it('should return null when no coordinate is provided', () => {
    expect(coordinatesToBounds([])).toBeNull();
  });

  it('should return the south-west and north-east corners of the coordinates', () => {
    // Arrange
    const coordinates = [
      { latitude: 48.85, longitude: 2.35 },
      { latitude: 43.29, longitude: 5.37 },
      { latitude: 45.76, longitude: -0.63 },
    ];

    // Act
    const bounds = coordinatesToBounds(coordinates);

    // Assert
    expect(bounds).toEqual([
      [-0.63, 43.29],
      [5.37, 48.85],
    ]);
  });

  it('should return a degenerate box when a single coordinate is provided', () => {
    const bounds = coordinatesToBounds([{ latitude: 10, longitude: 20 }]);

    expect(bounds).toEqual([
      [20, 10],
      [20, 10],
    ]);
  });
});
