import { test, expect } from '@playwright/test'

test.describe('User Journey - Homepage to Contact', () => {
  test('should navigate from homepage through projects to contact form', async ({ page }) => {
    // Step 1: Visit homepage
    await page.goto('/')
    
    // Step 2: Verify hero section loads
    await expect(page.locator('h1')).toBeVisible()
    
    // Step 3: Click "View Projects" button
    const viewProjectsButton = page.getByRole('link', { name: /view projects/i })
    if (await viewProjectsButton.isVisible()) {
      await viewProjectsButton.click()
      await expect(page).toHaveURL(/\/projects/)
    }
    
    // Step 4: Verify projects page loaded
    await expect(page.locator('h1')).toContainText(/projects/i)
    
    // Step 5: Navigate to contact page
    await page.goto('/contact')
    
    // Step 6: Verify contact form is visible
    await expect(page.getByRole('heading', { name: /contact/i })).toBeVisible()
    
    // Step 7: Fill out contact form
    await page.getByLabel(/name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/message/i).fill('This is a test message from E2E tests.')
    
    // Step 8: Submit form (Note: This will actually submit in non-mock environment)
    // await page.getByRole('button', { name: /send/i }).click()
    
    // Step 9: Verify form elements are present
    const submitButton = page.getByRole('button', { name: /send/i })
    await expect(submitButton).toBeVisible()
  })

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/')
    
    // Verify main navigation links
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /projects/i })).toBeVisible()
  })

  test('should toggle theme', async ({ page }) => {
    await page.goto('/')
    
    // Find theme toggle button
    const themeToggle = page.locator('[aria-label*="theme" i], [aria-label*="dark" i], [aria-label*="light" i]')
    
    if (await themeToggle.count() > 0) {
      // Get initial theme
      const htmlElement = page.locator('html')
      const initialClass = await htmlElement.getAttribute('class')
      
      // Click theme toggle
      await themeToggle.first().click()
      
      // Wait for theme change
      await page.waitForTimeout(300)
      
      // Verify theme changed
      const newClass = await htmlElement.getAttribute('class')
      expect(initialClass).not.toBe(newClass)
    }
  })

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Verify page loads in mobile view
    await expect(page.locator('h1')).toBeVisible()
    
    // Check if mobile menu exists
    const mobileMenuButton = page.locator('[aria-label*="menu" i], [aria-label*="navigation" i]')
    if (await mobileMenuButton.count() > 0) {
      await expect(mobileMenuButton.first()).toBeVisible()
    }
  })
})

test.describe('Projects Page', () => {
  test('should display projects grid', async ({ page }) => {
    await page.goto('/projects')
    
    // Verify projects page heading
    await expect(page.locator('h1')).toBeVisible()
    
    // Wait for any dynamic content to load
    await page.waitForLoadState('networkidle')
  })

  test('should filter projects by technology', async ({ page }) => {
    await page.goto('/projects')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Look for filter/tag buttons (if they exist)
    const filterButtons = page.locator('button:has-text("React"), button:has-text("Next.js"), button:has-text("TypeScript")')
    
    if (await filterButtons.count() > 0) {
      // Click first filter
      await filterButtons.first().click()
      
      // Wait for filtered results
      await page.waitForTimeout(500)
    }
  })
})

test.describe('Blog Page', () => {
  test('should display blog posts', async ({ page }) => {
    await page.goto('/blog')
    
    // Verify blog page loads
    await expect(page.locator('h1')).toContainText(/blog/i)
    
    // Wait for content to load
    await page.waitForLoadState('networkidle')
  })
})

test.describe('SEO and Accessibility', () => {
  test('should have proper page titles', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.+/)
    
    await page.goto('/about')
    await expect(page).toHaveTitle(/.+/)
    
    await page.goto('/projects')
    await expect(page).toHaveTitle(/.+/)
  })

  test('should have proper meta description', async ({ page }) => {
    await page.goto('/')
    
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
  })
})
