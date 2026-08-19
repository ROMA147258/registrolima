import { Personero } from './Personero.js';

export class Coordinador extends Personero {
  constructor(props) {
    super({
      ...props,
      rolADesempenar: props.rolADesempenar || 'Coordinador de Local'
    });
  }
}
