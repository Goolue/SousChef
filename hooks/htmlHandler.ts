import cheerio from 'cheerio';
import { measureDuration } from './utils/durationUtils';
import axios from 'axios';

export default async function getHtml(url: string): Promise<string> {
    return measureDuration('getHtml', async () => {
        try {
            const response = await axios.get(url, { responseType: 'text' });

            const $ = cheerio.load(response.data);

            $('script').remove();
            $('style').remove();

            const textElementsArr: string[] = [];
            $('h1, h2, h3, h4, h5, h6, p, li').each((index, element) => {
                textElementsArr.push($(element).text());
            });

            return textElementsArr.join('\n');
        } catch (error) {
            console.error('Error in getHtml:', error);
            return '';
        }
    });
}
