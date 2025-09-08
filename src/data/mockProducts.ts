import BatteryImag from '../../src/Assets/imagebattery.png';
import SolarImag from '../../src/Assets/img.png';
import SolasImag from '../../src/Assets/solas.png';
import PanelImag from '../../src/Assets/image.png';

const products = {
  Jinko: [
    { name: '300w Solar Panel', price: 150009, image: BatteryImag , canCart: true },
    { name: '350w Solar Panel', price: 190009, image: SolarImag, canCart: false },
    { name: '550w Solar Panel', price: 250009, image: SolasImag, canCart: false },
    { name: '550w Solar Panel', price: 450009, image: PanelImag, canCart: true },
    { name: '600w Solar Panel', price: 650009, image: BatteryImag, canCart: false },
  ],
};

export default products;
