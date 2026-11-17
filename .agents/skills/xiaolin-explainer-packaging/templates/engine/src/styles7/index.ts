// Seven whole-frame styles. Each module owns material, type, colour, title / end motion and the empty backdrop.
// Topic content (photos, props, logos, data) is added per episode on top; nothing here is topic-specific.
import * as S_finance from './finance';
import * as S_press from './press';
import * as S_terminal from './terminal';
import * as S_banknote from './banknote';
import * as S_casefile from './casefile';
import * as S_chalk from './chalk';
import * as S_pixelgame from './pixelgame';
export const STYLE7: any = {finance: S_finance, press: S_press, terminal: S_terminal, banknote: S_banknote, casefile: S_casefile, chalk: S_chalk, pixelgame: S_pixelgame};
export const STYLE7_BASE: any = {'finance': 'finance', 'press': 'press', 'terminal': 'terminal', 'banknote': 'press', 'casefile': 'press', 'chalk': 'finance', 'pixelgame': 'terminal'};
