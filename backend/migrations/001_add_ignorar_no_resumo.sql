-- Migration: adiciona flag para ignorar transações no resumo financeiro
-- Use case principal: pagamentos de fatura de cartão de crédito que já foram
-- contabilizados como gastos no mês em que as compras foram feitas.

ALTER TABLE transacoes
    ADD COLUMN IF NOT EXISTS ignorar_no_resumo BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN transacoes.ignorar_no_resumo IS
    'Quando TRUE, a transação é excluída dos cálculos de despesas/receitas/resumo. '
    'Usado principalmente para pagamentos de fatura de cartão de crédito, '
    'evitando dupla contagem com os gastos já registrados na fatura.';
