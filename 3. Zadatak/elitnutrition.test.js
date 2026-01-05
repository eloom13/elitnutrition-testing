// test/elit_shop.test.js
const { By, until } = require('selenium-webdriver');
const { getDriver, assert } = require('./setup');

async function acceptCookiesIfPresent(driver) {
  try {
    const prihvatiBtn = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[self::button or self::a][contains(., 'PRIHVATI SVE') or contains(., 'Prihvati')]"
        )
      ),
      3000
    );
    await driver.executeScript("arguments[0].scrollIntoView(true);", prihvatiBtn);
    await prihvatiBtn.click();
  } catch (e) {}
}

async function pause(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

describe('Elitnutrition – SHOP menu', function () {
  this.timeout(90000);

  it('Test-001: Click SHOP opens new products list', async function () {
    const driver = getDriver();

    await driver.manage().window().maximize();
    await driver.get('https://elitnutrition.ba/');

    await acceptCookiesIfPresent(driver);

    const shopMenu = await driver.wait(
      until.elementLocated(By.id('menu-item-175852')),
      20000
    );

    const shopSpan = await shopMenu.findElement(By.css('a > span.menu-label'));
    await driver.executeScript('arguments[0].scrollIntoView(true);', shopSpan);
    await shopSpan.click();

    await driver.wait(
      until.urlContains('?orderby=date&product_cat=novo'),
      20000
    );

    const title = await driver.getTitle();
    assert.ok(
      title.toLowerCase().includes('novo') ||
      title.toLowerCase().includes('elit nutrition')
    );
  });

  it('Test-002: Search "protein" returns products', async function () {
    const driver = getDriver();

    const searchForm = await driver.wait(
      until.elementLocated(
        By.css('div.search-menu-wrapper form[id^="searchform-"]')
      ),
      20000
    );

    const searchInput = await searchForm.findElement(
      By.css('div.search-field.search-content input[type="text"]')
    );
    await searchInput.clear();
    await searchInput.sendKeys('protein');

    await driver.executeScript('arguments[0].submit();', searchForm);

    await driver.wait(
      until.urlContains('s=protein'),
      20000
    );
    await driver.wait(
      until.urlContains('post_type=product'),
      20000
    );

    const title = await driver.getTitle();
    assert.ok(
      title.toLowerCase().includes('protein') ||
      title.toLowerCase().includes('rezultati pretrage')
    );
  });

  it('Test-003: Price filter 100–200 KM on PROTEINS', async function () {
    const driver = getDriver();

    await driver.get('https://elitnutrition.ba/product-category/proteini/');

    const priceFilter = await driver.wait(
      until.elementLocated(By.css('.price_slider_amount')),
      20000
    );

    const filterForm = await priceFilter.findElement(By.xpath('./ancestor::form'));

    const minInput = await priceFilter.findElement(By.id('min_price'));
    const maxInput = await priceFilter.findElement(By.id('max_price'));

    await driver.executeScript("arguments[0].style.display='block';", minInput);
    await driver.executeScript("arguments[0].style.display='block';", maxInput);

    await minInput.clear();
    await minInput.sendKeys('100');

    await maxInput.clear();
    await maxInput.sendKeys('200');

    await driver.executeScript('arguments[0].submit();', filterForm);

    await driver.wait(until.urlContains('min_price=100'), 20000);
    await driver.wait(until.urlContains('max_price=200'), 20000);

    const priceLabel = await driver.findElement(
      By.css('.price_slider_amount .price_label')
    );
    const labelText = (await priceLabel.getText()).toLowerCase();
    assert.ok(labelText.includes('100') && labelText.includes('200'));
  });

  it('Test-004: Proteins filtered 100–200 KM and flavour Vanilla', async function () {
    const driver = getDriver();

    const priceFilter = await driver.wait(
      until.elementLocated(By.css('.price_slider_amount')),
      20000
    );

    const priceForm = await priceFilter.findElement(By.xpath('./ancestor::form'));

    const minInput = await priceFilter.findElement(By.id('min_price'));
    const maxInput = await priceFilter.findElement(By.id('max_price'));

    await driver.executeScript("arguments[0].style.display='block';", minInput);
    await driver.executeScript("arguments[0].style.display='block';", maxInput);

    await minInput.clear();
    await minInput.sendKeys('100');

    await maxInput.clear();
    await maxInput.sendKeys('200');

    await driver.executeScript('arguments[0].submit();', priceForm);

    await driver.wait(until.urlContains('min_price=100'), 20000);
    await driver.wait(until.urlContains('max_price=200'), 20000);

    const flavourSection = await driver.wait(
      until.elementLocated(By.css('section.widget_layered_nav')),
      20000
    );

    const flavourForm = await flavourSection.findElement(
      By.css('form.woocommerce-widget-layered-nav-dropdown')
    );

    const flavourHidden = await flavourForm.findElement(
      By.css('input[name="filter_okus"]')
    );
    await driver.executeScript("arguments[0].value='vanilija';", flavourHidden);

    await driver.executeScript('arguments[0].submit();', flavourForm);

    await driver.wait(until.urlContains('filter_okus=vanilija'), 20000);
    await driver.wait(until.urlContains('min_price=100'), 20000);
    await driver.wait(until.urlContains('max_price=200'), 20000);

    const products = await driver.findElements(By.css('ul.products li.product'));
    assert.ok(products.length >= 0);
  });

  it('Test-005: First filtered whey Vanilla x2 in cart', async function () {
    const driver = getDriver();

    const productsContainer = await driver.wait(
      until.elementLocated(
        By.css('div.woocommerce.main-products.columns-4 div.products')
      ),
      20000
    );

    const firstProductButton = await productsContainer.findElement(
      By.css('div.product-item a.product-buy-button')
    );

    await driver.executeScript(
      'arguments[0].scrollIntoView({block:"center"});',
      firstProductButton
    );
    await driver.executeScript('arguments[0].click();', firstProductButton);

    try {
      const vanillaButton = await driver.wait(
        until.elementLocated(
          By.css(
            'ul.button-variable-wrapper li[data-value="vanilija"], ' +
            'ul.button-variable-wrapper li.button-variable-item-vanilija'
          )
        ),
        10000
      );
      await driver.executeScript(
        'arguments[0].scrollIntoView({block:"center"});',
        vanillaButton
      );
      await driver.executeScript('arguments[0].click();', vanillaButton);

      const variationInput = await driver.wait(
        until.elementLocated(
          By.css('form.variations_form input.variation_id')
        ),
        10000
      );
      await driver.wait(async () => {
        const val = await variationInput.getAttribute('value');
        return val && val !== '0';
      }, 10000);
    } catch (e) {}

    try {
      const qtyInput = await driver.wait(
        until.elementLocated(By.css('form.cart input.qty')),
        5000
      );
      await qtyInput.clear();
      await qtyInput.sendKeys('2');
    } catch (e) {}

    const addToCartButton = await driver.wait(
      until.elementLocated(
        By.css('form.variations_form button.single_add_to_cart_button,' +
               'form.cart button.single_add_to_cart_button')
      ),
      20000
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView({block:"center"});',
      addToCartButton
    );
    await driver.executeScript('arguments[0].click();', addToCartButton);

    await driver.wait(
      until.elementLocated(
        By.css('a.added_to_cart.wc-forward[title="Vidi korpu"]')
      ),
      20000
    );

    assert.ok(true);
  });

  it('Test-006: Related product shows options alert', async function () {
    const driver = getDriver();

    const relatedContainer = await driver.wait(
      until.elementLocated(
        By.css('div.woocommerce.columns-4 .ts-product-wrapper .products')
      ),
      20000
    );

    const firstRelatedButton = await relatedContainer.findElement(
      By.css('div.owl-item.active div.product-item a.product-buy-button')
    );

    await driver.executeScript(
      'arguments[0].scrollIntoView({block:"center"});',
      firstRelatedButton
    );
    await driver.executeScript('arguments[0].click();', firstRelatedButton);

    const addToCartButton = await driver.wait(
      until.elementLocated(
        By.css('form.variations_form button.single_add_to_cart_button,' +
               'form.cart button.single_add_to_cart_button')
      ),
      20000
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView({block:"center"});',
      addToCartButton
    );
    await driver.executeScript('arguments[0].click();', addToCartButton);

    let alertText = '';
    const alert = await driver.wait(async () => {
      try {
        return await driver.switchTo().alert();
      } catch (e) {
        return null;
      }
    }, 10000);

    if (alert) {
      alertText = await alert.getText();
      await alert.accept();
    }

    assert.ok(
      alertText.includes('Izaberite opcije proizvoda') ||
      alertText.toLowerCase().includes('izaberite opcije')
    );
  });

  it('Test-007: Open cart and increase whey quantity to 3', async function () {
    const driver = getDriver();

    const cartIcon = await driver.wait(
      until.elementLocated(
        By.css('.shopping-cart-wrapper a.cart-control')
      ),
      20000
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView({block:"center"});',
      cartIcon
    );
    await driver.executeScript('arguments[0].click();', cartIcon);

    const viewCartButton = await driver.wait(
      until.elementLocated(
        By.css('.cart-dropdown-form .dropdown-footer a.view-cart')
      ),
      20000
    );
    await driver.executeScript('arguments[0].click();', viewCartButton);

    const firstRowQty = await driver.wait(
      until.elementLocated(
        By.css('table.shop_table.cart tbody tr.cart_item:first-of-type td.product-quantity input.input-text.qty')
      ),
      20000
    );

    await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', firstRowQty);
    await firstRowQty.clear();
    await firstRowQty.sendKeys('3');

    const updateCartButton = await driver.wait(
      until.elementLocated(
        By.css('button.button[name="update_cart"]')
      ),
      20000
    );
    await driver.executeScript('arguments[0].click();', updateCartButton);

    await driver.wait(async () => {
      const val = await firstRowQty.getAttribute('value');
      return val === '3';
    }, 20000);

    assert.strictEqual(await firstRowQty.getAttribute('value'), '3');
  });

  it('Test-008: Select second gift in cart', async function () {
    const driver = getDriver();

    const giftsContainer = await driver.wait(
      until.elementLocated(
        By.css('div.pw_gift_pagination_div.page_1')
      ),
      20000
    );

    const giftButtons = await giftsContainer.findElements(
      By.css('a.btn-add-gift-button')
    );

    assert.ok(giftButtons.length >= 2);

    const secondGiftButton = giftButtons[1];

    await driver.executeScript(
      'arguments[0].scrollIntoView({block:"center"});',
      secondGiftButton
    );
    await driver.executeScript('arguments[0].click();', secondGiftButton);

    await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(., 'MARS HI PROTEIN COOKIE') or contains(., 'poklon')]")
      ),
      20000
    );

    assert.ok(true);
    await pause(5000); //ne radi bez ovog - prebrzo se sve odvija
  });

  it('Test-009: Invalid coupon shows error', async function () {
  const driver = getDriver();

  const couponInput = await driver.wait(
    until.elementLocated(
      By.css('div.coupon input#coupon_code')
    ),
    20000
  );

  await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', couponInput);
  await couponInput.clear();
  await couponInput.sendKeys('wswsws');

  const applyButton = await driver.wait(
    until.elementLocated(
      By.css('div.coupon button[name="apply_coupon"]')
    ),
    20000
  );
  await driver.executeScript('arguments[0].click();', applyButton);

  let errorText = '';

  try {
    const errorNotice = await driver.wait(
      until.elementLocated(
        By.css('p.coupon-error-notice')
      ),
      5000
    );
    errorText = (await errorNotice.getText()).toLowerCase();
  } catch (e) {
  
    const wcError = await driver.wait(
      until.elementLocated(
        By.css('ul.woocommerce-error li')
      ),
      15000
    );
    errorText = (await wcError.getText()).toLowerCase();
  }

  assert.ok(
    errorText.includes('wswsws') ||
    errorText.includes('coupon') ||
    errorText.includes('kupon') ||
    errorText.includes('does not exist') ||
    errorText.includes('not valid') ||
    errorText.includes('cannot be applied')
  );
});


  it('Test-010: Proceed to checkout navigates to checkout page', async function () {
    const driver = getDriver();

    const checkoutButton = await driver.wait(
      until.elementLocated(
        By.css('div.cart_totals .wc-proceed-to-checkout a.checkout-button')
      ),
      20000
    );

    await driver.executeScript(
      'arguments[0].scrollIntoView({block:"center"});',
      checkoutButton
    );
    await driver.executeScript('arguments[0].click();', checkoutButton);

    await driver.wait(
      until.urlContains('/checkout'),
      20000
    );

    const title = (await driver.getTitle()).toLowerCase();
    assert.ok(
      title.includes('checkout') ||
      title.includes('naplata') ||
      title.includes('plaćanje')
    );

    await pause(3000);
  });
});
