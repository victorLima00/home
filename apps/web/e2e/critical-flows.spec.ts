import { expect, test } from '@playwright/test';

test.describe('Fluxos críticos do frontend HOME', () => {
  test('navega para cômodos e abre detalhe de um cômodo', async ({ page }) => {
    await page.goto('/dashboard/rooms');

    await expect(page.getByRole('heading', { name: 'Cômodos' })).toBeVisible();

    await page
      .getByRole('heading', { name: /Cozinha Integrada/i })
      .first()
      .click();

    await expect(page.getByRole('heading', { name: /Cozinha Integrada/i }).first()).toBeVisible();
    await expect(page.getByText(/Itens deste cômodo/i)).toBeVisible();
  });

  test('marca item como comprado na lista de itens', async ({ page }) => {
    await page.goto('/dashboard/items');

    const checkboxPrimeiroItem = page.getByTestId('item-checkbox-1');

    await expect(checkboxPrimeiroItem).not.toBeChecked();
    await checkboxPrimeiroItem.check();
    await expect(checkboxPrimeiroItem).toBeChecked();

    await expect(page.getByTestId('itens-resumo')).toContainText('3 de 5');
  });

  test('abre formulário de novo item e preenche campos principais', async ({ page }) => {
    await page.goto('/dashboard/items/new');

    await page.getByTestId('abrir-form-novo-item').click();

    await expect(page.getByRole('heading', { name: /Novo Item/i }).first()).toBeVisible();

    await page.getByLabel('Nome do item').fill('Mesa lateral de teste');
    await page.getByLabel('Cômodo').selectOption('Sala');
    await page.getByLabel('Prioridade').selectOption('Importante');

    await expect(page.getByLabel('Nome do item')).toHaveValue('Mesa lateral de teste');
    await expect(page.getByLabel('Cômodo')).toHaveValue('Sala');
    await expect(page.getByLabel('Prioridade')).toHaveValue('Importante');
  });

  test('realiza busca de promoções e exibe resultado simulado', async ({ page }) => {
    await page.goto('/dashboard/promotions');

    await page.getByPlaceholder('Ex: Sofá, Espelho, Cortina...').fill('Sofá retrátil');
    await page.getByRole('button', { name: /Buscar/i }).click();

    await expect(page.getByText('Resultados para "Sofá retrátil"')).toBeVisible();
    await expect(page.getByText('Produto Exemplo')).toBeVisible();
  });
});
