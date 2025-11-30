import { useCurrency } from '@/context/CurrencyContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CurrencySwitcher() {
  const { currency, changeCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={changeCurrency}>
      <SelectTrigger className="w-24 h-9 bg-white border-orange-200">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CHF">CHF</SelectItem>
        <SelectItem value="EUR">EUR</SelectItem>
      </SelectContent>
    </Select>
  );
}
