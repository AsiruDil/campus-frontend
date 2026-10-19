import { Buffer } from "node:buffer";
import { test, expect } from "@playwright/test";

const pdf = {
  name: "CV.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\nBrowser test\n%%EOF"),
};
test.describe.configure({ mode: "serial" });
async function login(page, role) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Login", exact: true })
    .first()
    .click();
  await page.getByPlaceholder("Username or Email").fill(role);
  await page
    .getByPlaceholder("Password", { exact: true })
    .fill("BrowserTest!234");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Login", exact: true })
    .click();
  await expect(page).toHaveURL(
    role === "superadmin"
      ? /\/super-admin\/users/
      : role === "admin"
        ? /\/admin/
        : /\/home/,
  );
}

test("applicant submits NIC, CV and supporting files through the existing vacancy workflow", async ({
  page,
}) => {
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await login(page, "user");
  await page.locator('a[href="/home/jobDetails/JOB00001"]').click();
  await page.getByRole("button", { name: /Apply/ }).first().click();
  await page.getByLabel(/NIC number/).fill("200012345678");
  await page.getByLabel(/Mobile number/).fill("+94771234567");
  await page.getByLabel(/CV —/).setInputFiles(pdf);
  await page
    .getByLabel(/Certificates & research papers/)
    .setInputFiles({ ...pdf, name: "certificate.pdf" });
  await page
    .getByRole("button", { name: "Submit application", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Application received" }),
  ).toBeVisible();
  expect(failures).toEqual([]);
});
test("Admin filters, shortlists, emails, downloads ZIP and makes review decisions", async ({
  page,
}) => {
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await login(page, "admin");
  await page.getByLabel("Search applicants").fill("Nimali");
  await expect(page.getByRole("button", { name: "Nimali Test" })).toBeVisible();
  await page.getByLabel("Position category").selectOption("lecturer");
  await page.getByLabel("Select Nimali Test for Lecturer in Computing").check();
  await page
    .getByRole("button", { name: "Shortlist selected", exact: true })
    .click();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByRole("button", { name: "Nimali Test" }) });
  await expect(row.getByText("Shortlisted", { exact: true })).toBeVisible();
  await page.getByLabel("Select Nimali Test for Lecturer in Computing").check();
  await page
    .getByRole("button", { name: "Email shortlist", exact: true })
    .click();
  await page
    .getByLabel("Subject", { exact: true })
    .fill("Interview invitation");
  await page
    .getByLabel("Message", { exact: true })
    .fill("You have been shortlisted. Please attend the interview.");
  await page.getByRole("button", { name: "Send email to all" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(row.getByText(/Emailed/)).toBeVisible();
  const download = page.waitForEvent("download");
  await row.getByRole("button", { name: "ZIP package" }).click();
  expect((await download).suggestedFilename()).toMatch(/\.zip$/);
  for (const [value, label] of [
    ["selected", "Selected"],
    ["rejected", "Rejected"],
    ["hold", "On hold"],
  ]) {
    await page.getByLabel("Review status").selectOption("");
    await row.getByLabel("Review decision for Nimali Test").selectOption(value);
    await row.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(row.getByText(label, { exact: true })).toBeVisible();
    await page.getByLabel("Review status").selectOption(value);
    await expect(
      page.getByRole("button", { name: "Nimali Test" }),
    ).toBeVisible();
  }
  await page.screenshot({
    path: "test-results/review-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Nimali Test" }).click();
  await expect(
    page.getByRole("dialog").getByText("200012345678"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  expect(failures).toEqual([]);
});
test("Super Admin updates deadline and deletes only expired document packages", async ({
  page,
}) => {
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await login(page, "superadmin");
  await page.getByRole('button', {name:'Edit access for admin',exact:true}).click();
  await expect(page.getByLabel('Assigned faculty')).toHaveValue('Science');
  await expect(page.getByLabel('Assigned department')).toHaveValue('Computing');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole("link", { name: "Manage Job Vacancies" }).click();
  // Open the vacancy details first, then use its existing edit control.
  await page
    .getByRole("row")
    .filter({ hasText: "Lecturer in Computing" })
    .getByRole("button", { name: "Edit Lecturer in Computing", exact: true })
    .click();
  await page
    .getByLabel("Application deadline (your local time)")
    .fill("2030-12-31T17:30");
  await page.getByRole("button", { name: "Update Job" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Lecturer in Computing" }),
  ).toContainText("2030");
  await page.getByRole("link", { name: "Applications", exact: true }).click();
  await expect(
    page.getByText(/1 document package\(s\) eligible/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete expired documents", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Permanently delete expired documents" })
    .click();
  await expect(
    page.getByText(/0 document package\(s\) eligible/),
  ).toBeVisible();
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: "Expired Applicant" })
      .getByText("Removed after 5 years"),
  ).toBeVisible();
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: "Nimali Test" })
      .getByRole("button", { name: "ZIP package" }),
  ).toBeVisible();
  expect(failures).toEqual([]);
});
test("mobile review layout keeps filters and actions usable without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // Use the login API here; the desktop login flow is covered in the preceding tests.
  const response = await page.request.post(
    "http://127.0.0.1:3001/api/users/login",
    {
      data: { userName: "admin", email: "admin", password: "BrowserTest!234" },
    },
  );
  const { token, type } = await response.json();
  await page.goto("/");
  await page.evaluate(
    ({ token, type }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("userType", type);
    },
    { token, type },
  );
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Applications", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Position category")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/review-mobile.png",
    fullPage: true,
  });
});
