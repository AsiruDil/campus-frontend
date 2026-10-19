import { Buffer } from 'node:buffer';
import { test, expect } from '@playwright/test';

test('admin directories support search, status filters, visibility actions and mobile layout', async ({ page }) => {
  const response = await page.request.post('http://127.0.0.1:3001/api/users/login', {
    data: { userName: 'superadmin', email: 'superadmin', password: 'BrowserTest!234' },
  });
  const { token, type } = await response.json();
  await page.goto('/');
  await page.evaluate(({ token, type }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', type);
  }, { token, type });
  await page.goto('/super-admin/users');
  await expect(page.getByRole('button', { name: 'Edit access for admin', exact: true })).toBeVisible();
  await page.getByLabel('Search users').fill('no-such-account');
  await expect(page.getByRole('heading', { name: 'No users found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByRole('button', { name: 'Block user', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Unblock user', exact: true })).toBeVisible();
  await page.getByLabel('Account status').selectOption('blocked');
  await expect(page.getByRole('button', { name: 'Edit access for admin', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Unblock user', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No users found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.screenshot({ path: 'test-results/admin-users-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('main')).toHaveCSS('margin-left', '0px');
  await expect.poll(async () => {
    const box = await page.getByRole('link', { name: 'Manage Users', exact: true }).boundingBox();
    return box.x + box.width <= 0;
  }).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/admin-users-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/super-admin/vacancies');
  await expect(page.getByRole('button', { name: 'Edit Lecturer in Computing', exact: true })).toBeVisible();
  await page.getByLabel('Search vacancies').fill('no-such-job');
  await expect(page.getByRole('heading', { name: 'No matching vacancies' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByRole('button', { name: 'Hide Lecturer in Computing', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show Lecturer in Computing', exact: true })).toBeEnabled();
  await page.getByLabel('Vacancy status').selectOption('hidden');
  await expect(page.getByRole('button', { name: 'Show Lecturer in Computing', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Show Lecturer in Computing', exact: true }).click();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('button', { name: 'Hide Lecturer in Computing', exact: true })).toBeEnabled();
  await page.screenshot({ path: 'test-results/admin-vacancies-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('main')).toHaveCSS('margin-left', '0px');
  await expect.poll(async () => {
    const box = await page.getByRole('link', { name: 'Manage Users', exact: true }).boundingBox();
    return box.x + box.width <= 0;
  }).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/admin-vacancies-mobile.png', fullPage: true });
});


test('position category resets an incompatible vacancy and shows each category', async ({ page }) => {
  const response = await page.request.post('http://127.0.0.1:3001/api/users/login', {
    data: { userName: 'superadmin', email: 'superadmin', password: 'BrowserTest!234' },
  });
  const { token, type } = await response.json();
  const applications = ['lecturer', 'probationary', 'demo'].map((category, index) => ({
    _id: `category-test-${index}`, jobId: `JOB-CATEGORY-${index}`, category,
    jobRole: ['Lecturer in Computing', 'Probationary lecturer in Physics', 'Demonstrator in Chemistry'][index],
    firstName: ['Lecturer', 'Probationary', 'Demonstrator'][index], lastName: 'Applicant',
    email: `${category}@example.test`, status: 'pending', date: '2026-01-01',
  }));
  await page.route('**/api/apply?*', route => {
    const category = new URL(route.request().url()).searchParams.get('category');
    return route.fulfill({ json: applications.filter(a => !category || a.category === category) });
  });
  await page.route('**/api/apply', route => route.fulfill({ json: applications }));
  await page.goto('/');
  await page.evaluate(({ token, type }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', type);
  }, { token, type });
  await page.goto('/super-admin/applications');
  await page.getByRole('combobox', { name: 'Vacancy', exact: true }).selectOption('JOB-CATEGORY-0');
  for (const [category, applicant] of [['probationary', 'Probationary Applicant'], ['demo', 'Demonstrator Applicant'], ['lecturer', 'Lecturer Applicant']]) {
    await page.getByLabel('Position category').selectOption(category);
    await expect(page.getByRole('combobox', { name: 'Vacancy', exact: true })).toHaveValue('');
    await expect(page.getByRole('button', { name: applicant, exact: true })).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await page.getByRole('combobox', { name: 'Vacancy', exact: true }).selectOption(applications.find(a => a.category === category).jobId);
  }
  await page.getByLabel('Position category').selectOption('');
  await expect(page.locator('tbody tr')).toHaveCount(3);
});




test('Super Admin saves and reloads all-faculty and all-department assignments', async ({ page }) => {
  const response = await page.request.post('http://127.0.0.1:3001/api/users/login', {
    data: { userName: 'superadmin', email: 'superadmin', password: 'BrowserTest!234' },
  });
  const { token, type } = await response.json();
  await page.goto('/');
  await page.evaluate(({ token, type }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', type);
  }, { token, type });
  await page.goto('/super-admin/users');
  await page.getByRole('button', { name: 'Edit access for admin', exact: true }).click();
  await page.getByLabel('Assign all faculties', { exact: true }).check();
  await page.getByLabel('Assign all departments', { exact: true }).check();
  await expect(page.getByLabel('Assigned faculty', { exact: true })).toBeDisabled();
  await expect(page.getByLabel('Assigned department', { exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Edit access for admin', exact: true }).click();
  await expect(page.getByLabel('Assign all faculties', { exact: true })).toBeChecked();
  await expect(page.getByLabel('Assign all departments', { exact: true })).toBeChecked();
  await page.getByLabel('Assign all faculties', { exact: true }).uncheck();
  await page.getByLabel('Assigned faculty', { exact: true }).fill('Science');
  await page.getByLabel('Assigned department', { exact: true }).fill('Computing');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});


test('new category, faculty, job type and location can be created and reused', async ({ page }) => {
  const response = await page.request.post('http://127.0.0.1:3001/api/users/login', {
    data: { userName: 'superadmin', email: 'superadmin', password: 'BrowserTest!234' },
  });
  const { token, type } = await response.json();
  await page.goto('/');
  await page.evaluate(({ token, type }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', type);
  }, { token, type });
  await page.goto('/super-admin/vacancies');
  await page.getByRole('button', { name: 'Add Job', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Location', exact: true })).toHaveValue('Main Campus');
  await page.getByLabel('Job Role', { exact: true }).fill('Research Fellow');
  for (const [label, value] of [['Position category', 'Research fellow'], ['Faculty', 'Graduate Studies'], ['Job Type', 'Contract'], ['Location', 'City Campus']]) {
    await page.getByRole('combobox', { name: label, exact: true }).selectOption('__add_new__');
    await page.getByLabel(`New ${label.toLowerCase()}`, { exact: true }).fill(value);
    await page.getByRole('button', { name: 'Add option', exact: true }).click();
    await expect(page.getByRole('combobox', { name: label, exact: true })).toHaveValue(value);
  }
  await page.getByLabel('Department', { exact: true }).fill('Research');
  await page.getByLabel('Application deadline (your local time)').fill('2031-12-31T17:30');
  await page.getByRole('button', { name: 'Create Job', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Edit Research Fellow', exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Add Job', exact: true }).click();
  for (const [label, value] of [['Position category', 'Research fellow'], ['Faculty', 'Graduate Studies'], ['Job Type', 'Contract'], ['Location', 'City Campus']]) {
    await page.getByRole('combobox', { name: label, exact: true }).selectOption(value);
    await expect(page.getByRole('combobox', { name: label, exact: true })).toHaveValue(value);
  }
});


test('admin sidebar combines applicant views with email status and opens details', async ({ page }) => {
  const response = await page.request.post('http://127.0.0.1:3001/api/users/login', {
    data: { userName: 'admin', email: 'admin', password: 'BrowserTest!234' },
  });
  const { token, type } = await response.json();
  const applications = [
    { _id: 'sidebar-1', firstName: 'Sent', lastName: 'Shortlist', status: 'shortlisted', lastNotifiedAt: '2026-01-02' },
    { _id: 'sidebar-2', firstName: 'Waiting', lastName: 'Shortlist', status: 'shortlisted' },
    { _id: 'sidebar-3', firstName: 'Chosen', lastName: 'Applicant', status: 'selected' },
  ].map(a => ({ ...a, jobId: 'JOB00001', jobRole: 'Lecturer', category: 'lecturer', email: 'test@example.test', date: '2026-01-01' }));
  await page.route(/\/api\/apply(?:\?|$)/, route => {
    const status = new URL(route.request().url()).searchParams.get('status');
    return route.fulfill({ json: applications.filter(a => !status || a.status === status) });
  });
  await page.goto('/');
  await page.evaluate(({ token, type }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', type);
  }, { token, type });
  await page.goto('/admin');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.getByRole('button', { name: 'Shortlisted applicants', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByRole('button', { name: 'Email not sent', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Waiting Shortlist', exact: true })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('button', { name: 'Email sent', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sent Shortlist', exact: true })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('button', { name: 'Selected applicants', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No applications found' })).toBeVisible();
  await page.getByRole('button', { name: 'Email not sent', exact: true }).click();
  await page.getByRole('button', { name: 'Chosen Applicant', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Application details');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Reset all filters', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.screenshot({ path: 'test-results/admin-review-sidebar.png', fullPage: true });
});


test('profiles are usable in every role and applicants complete missing profile details before applying', async ({ page }) => {
  for (const role of ['user', 'admin', 'superadmin']) {
    const response = await page.request.post('http://127.0.0.1:3001/api/users/login', { data: { userName: role, email: role, password: 'BrowserTest!234' } });
    const { token, type } = await response.json();
    await page.goto('/');
    await page.evaluate(({ token, type }) => { localStorage.setItem('token', token); localStorage.setItem('userType', type); }, { token, type });
    await page.goto(role === 'user' ? '/home' : role === 'admin' ? '/admin' : '/super-admin/users');
    await page.getByRole('button', { name: 'Open profile', exact: true }).first().click();
    await expect(page.getByRole('dialog', { name: 'Your profile' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Your profile' })).toContainText(`${role}@example.test`);
    await page.getByLabel('NIC / ID number').fill('200012345678');
    await page.getByRole('dialog', { name: 'Your profile' }).locator('input[type=file]').setInputFiles({ name: 'profile.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP1sAAAAASUVORK5CYII=', 'base64') });
    await expect(page.getByLabel('Date of birth')).not.toHaveValue('');
    await page.screenshot({ path: `test-results/profile-${role}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Save profile', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Your profile' })).toHaveCount(0);
  }
  const response = await page.request.post('http://127.0.0.1:3001/api/users/login', { data: { userName: 'user', email: 'user', password: 'BrowserTest!234' } });
  const { token, type } = await response.json();
  await page.request.put('http://127.0.0.1:3001/api/users/user', { headers: { Authorization: `Bearer ${token}` }, data: { id: '', birthday: '', age: null, gender: '' } });
  await page.evaluate(({ token, type }) => { localStorage.setItem('token', token); localStorage.setItem('userType', type); }, { token, type });
  await page.goto('/home/jobDetails/JOB00001');
  await page.getByRole('button', { name: /Apply/ }).first().click();
  await expect(page.getByRole('button', { name: 'Complete profile', exact: true })).toBeVisible();
  await expect(page.getByLabel(/NIC number/)).toBeDisabled();
  await page.getByRole('button', { name: 'Complete profile', exact: true }).click();
  await page.getByLabel('NIC / ID number').fill('200012345678');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Your profile' })).toHaveCount(0);
  await expect(page.getByLabel(/NIC number/)).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Complete profile', exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open profile', exact: true }).first().click();
  await expect(page.getByRole('dialog', { name: 'Your profile' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Save profile', exact: true })).toBeInViewport();
  await page.screenshot({ path: 'test-results/profile-mobile.png', fullPage: true });
});
