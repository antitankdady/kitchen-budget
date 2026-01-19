import { ref } from 'vue';

export function useTaxCalculator() {
    const baseAmount = ref<number | null>(null);
    const activeTaxRate = ref<number>(0);

    // 税率をリセットする（手動入力時など）
    const resetTax = () => {
        activeTaxRate.value = 0;
        baseAmount.value = null;
    };

    /**
     * 税率を適用または解除し、計算後の金額を返す
     * @param rate 適用したい税率 (例: 0.08, 0.10)
     * @param currentAmount 現在の入力金額
     * @returns 計算後の新しい金額、または変更なしなら null
     */
    const applyTax = (rate: number, currentAmount: number | null): number | null => {
        if (currentAmount === null || currentAmount === undefined) return null;

        // 現在課税されていない場合、基本金額（税抜）を保持する
        if (activeTaxRate.value === 0) {
            baseAmount.value = currentAmount;
        }

        // 選択中のボタンをクリックした場合、解除する（基本金額に戻す）
        if (activeTaxRate.value === rate) {
            const originalAmount = baseAmount.value !== null ? baseAmount.value : currentAmount;
            resetTax();
            return originalAmount;
        }

        // 基本金額に新しい税率を適用する
        if (baseAmount.value !== null) {
            activeTaxRate.value = rate;
            return Math.floor(baseAmount.value * (1 + rate));
        }

        return null;
    };

    /**
     * 既存のデータから状態を復元する（編集画面用）
     * @param amount 保存されている金額（税込）
     * @param taxRate 保存されている税率
     */
    const initializeFromExpense = (amount: number, taxRate?: number) => {
        if (taxRate && taxRate > 0) {
            activeTaxRate.value = taxRate;
            // 金額 = floor(基本 * (1+税率)) なので、基本 ≒ 金額 / (1+税率)
            // 切り捨てに対処するため ceil を使用（基本金額は通常整数）
            baseAmount.value = Math.ceil(amount / (1 + taxRate));
        } else {
            resetTax();
        }
    };

    return {
        baseAmount,
        activeTaxRate,
        applyTax,
        resetTax,
        initializeFromExpense
    };
}
