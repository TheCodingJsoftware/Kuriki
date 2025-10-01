export const strandIconDictionary: { [key: string]: string } = {
    'N': 'plus_one',
    'PR': 'timeline',
    'SS': 'shapes',
    'SP': 'bar_chart',
    'PF': 'account_balance_wallet',
    'M': 'straighten',
    'G': 'category',
    'AG': 'functions',
    'TG': 'square_foot',
    'CD': 'shopping_cart',
    'T': 'transform',
    'AC': 'construction',
    'A': 'calculate',
    'R': 'function',
    'L': 'psychology',
    'S': 'analytics',
    'RP': 'science',
    'I': 'credit_card',
    'MM': 'attach_money',
    'D': 'design_services',
    'FM': 'request_quote',
    'P': 'casino',
    'V': 'directions_car',
    'PM': 'speed',
    'C': 'work',
    'H': 'home',
    'GT': 'details',
    'B': 'business_center',
    'PCB': 'functions',
}


export class Strand {
    constructor(
        public id: string,
        public name: string
    ) { }

    getIcon(): string {
        return strandIconDictionary[this.id] as string;
    }

    toDict(): Record<string, string> {
        return { [this.id]: this.name };
    }
}
