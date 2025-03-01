import { Coordinates, OSMData, RawCoordinates } from "./types/interfaces";
import { delay } from "./utils/misc";

export class Osm {
  private apiBaseUrl = 'http://overpass-api.de/api/interpreter';
  private wayOpts = `'highway'~'motorway|residential|trunk|primary|motorway_link|trunk_list|primary_link|living_street|unclassified|tertiary|secondary'`;
    
  constructor (apiBaseUrl: string) { 
    if (apiBaseUrl) {
      this.apiBaseUrl = apiBaseUrl;
    }
  }

  /**
   * Gets the way/node data from the Overpass API, within a circle defined by a coordinate and a radius.
   * Use this method to get data for a route between two points that are close together (under 10 kilometers).
   * @param coord the center coordinate
   * @param radius the radius of the circle in kilometers
   * @returns the way/node OSM data from the Overpass API
   */
  async getOsmWayDataCircle (coord: Coordinates, radius: number): Promise<OSMData> {
    console.log('+getOsmWayDataCircle');
    const prompt = `way(around:${radius},${coord.lat},${coord.lon})[${this.wayOpts}]; out geom;`;
    console.log('prompt', prompt);
    const response = await this.fetchOsmData(prompt);
    console.log('Circle Data:', response);
    console.log('-getOsmWayDataCircle');
    return response;
  }

  /**
   * Gets the way/node data from the Overpass API, within a rectangle defined by two coordinates.
   * With padding 0, the rectangle is just a line between the two coordinates.
   * When padding value grows, the rectangle widens around the line.
   * Use this method to get data for a route between two points that are long distances apart (at least over 10 kilometeres).
   * 
   * @param coordA the first coordinate
   * @param coordB the second coordinate
   * @param padding value to widen the rectangle around the line in kilometers
   * @returns the way/node OSM data from the Overpass API
   */
  async getOsmWayDataRectangle (coord: Coordinates[]): Promise<OSMData> {
    console.log('+getOsmWayDataRectangle');
    const coords = coord.map(c => `${c.lat} ${c.lon}`).join(' ');
    const prompt = `way(poly:"${coords}")[${this.wayOpts}]; out geom;`;
    console.log('coords', coords);
    console.log('prompt', prompt);
    const response = await this.fetchOsmData(prompt);
    console.log('Rectangle data:', response);
    console.log('-getOsmWayDataRectangle');
    return response;
  }

  /**
   * Gets the way/node data from the Overpass API, within a rectangle defined by two coordinates.
   * With padding 0, the rectangle is just a line between the two coordinates.
   * When padding value grows, the rectangle widens around the line.
   * Use this method to get data for a route between two points that are long distances apart (at least over 10 kilometeres).
   * 
   * @param coordA the first coordinate
   * @param coordB the second coordinate
   * @param padding value to widen the rectangle around the line in kilometers
   * @returns the way/node OSM data from the Overpass API
   */
  private async fetchOsmData (execStr: string): Promise<OSMData> {
    console.log('+fetchOsmData');
    try {
      await delay(1000); // Add a one-second safety delay for API rate limiting
      console.log('fetchOsmData: after delay');
      const response = await fetch(`${this.apiBaseUrl}?data=[out:json][timeout:25];${execStr}`);
      console.log('fetchOsmData: response', response);
      const data = await response.json();
      console.log('fetchOsmData: data', data);
      console.log('-fetchOsmData');
      return data as OSMData;
    } catch (error) {
      console.error('fetchOsmData error:', error);
      return {} as OSMData;
    }
  }
}
