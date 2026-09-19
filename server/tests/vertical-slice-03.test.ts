/**
 * TAROPOD VERTICAL SLICE 03 INTEGRATION & HTTP VERIFICATION
 *
 * Tests all Vertical Slice 03 endpoints:
 * 1. GET /api/v1/categories
 * 2. GET /api/v1/categories/tree
 * 3. GET /api/v1/categories/:slug
 * 4. GET /api/v1/explore (with category, city, search queries)
 * 5. GET /api/v1/locations/businesses (with fallback coordinates)
 */

import express from 'express';
import { createServer } from 'http';
import { requestContextMiddleware } from '../middleware/context.ts';
import { authContextMiddleware, ensureSeedContext } from '../middleware/auth.ts';
import { apiRouter } from '../routes/api.ts';
import { taxonomyService } from '../modules/taxonomy/taxonomy.service.ts';

async function runVerticalSlice03Tests() {
  console.log('=====================================================');
  console.log('🏁 STARTING VERTICAL SLICE 03 API & TAXONOMY TESTS');
  console.log('=====================================================');

  await ensureSeedContext();
  await taxonomyService.ensureSeeded();

  const app = express();
  app.use(express.json());
  app.use(requestContextMiddleware);
  app.use(authContextMiddleware);
  app.use('/api/v1', apiRouter);

  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log(`✓ Test HTTP server listening on ${baseUrl}`);

  try {
    // -------------------------------------------------------------
    // 1. Categories Flat List
    // -------------------------------------------------------------
    console.log('\n[TEST 1] GET /api/v1/categories');
    const catRes = await fetch(`${baseUrl}/categories`);
    const catData = await catRes.json();
    const categories = Array.isArray(catData.data) ? catData.data : catData.data?.categories;
    if (!catRes.ok || !catData.success || !Array.isArray(categories)) {
      throw new Error(`Failed to list categories: ${JSON.stringify(catData)}`);
    }
    console.log(`✓ Retrieved ${categories.length} categories in flat list`);
    if (categories.length === 0) {
      throw new Error('Categories list should not be empty after seeding');
    }

    // Verify properties
    const firstCat = categories[0];
    if (!firstCat.slug || !firstCat.titleFa) {
      throw new Error(`Category item missing required fields: ${JSON.stringify(firstCat)}`);
    }
    console.log(`✓ Sample category verified: [${firstCat.slug}] ${firstCat.titleFa} (EN: ${firstCat.titleEn || 'N/A'})`);

    // -------------------------------------------------------------
    // 2. Categories Hierarchy Tree
    // -------------------------------------------------------------
    console.log('\n[TEST 2] GET /api/v1/categories/tree');
    const treeRes = await fetch(`${baseUrl}/categories/tree`);
    const treeData = await treeRes.json();
    const tree = Array.isArray(treeData.data) ? treeData.data : treeData.data?.tree;
    if (!treeRes.ok || !treeData.success || !Array.isArray(tree)) {
      throw new Error(`Failed to fetch category tree: ${JSON.stringify(treeData)}`);
    }
    console.log(`✓ Retrieved ${tree.length} root categories in tree`);

    // Check parent-child hierarchy
    const parentWithChildren = tree.find((n: any) => n.children && n.children.length > 0);
    if (!parentWithChildren) {
      throw new Error('Expected at least one category tree node with child subcategories');
    }
    console.log(`✓ Hierarchy verified: "${parentWithChildren.titleFa}" has ${parentWithChildren.children.length} subcategories`);
    console.log(`  Subcategories: ${parentWithChildren.children.map((c: any) => c.titleFa).join(', ')}`);

    // -------------------------------------------------------------
    // 3. Category Slug Lookup
    // -------------------------------------------------------------
    console.log('\n[TEST 3] GET /api/v1/categories/:slug');
    const testSlug = parentWithChildren.slug;
    const slugRes = await fetch(`${baseUrl}/categories/${testSlug}`);
    const slugData = await slugRes.json();
    if (!slugRes.ok || !slugData.success || slugData.data.slug !== testSlug) {
      throw new Error(`Failed to fetch category by slug '${testSlug}': ${JSON.stringify(slugData)}`);
    }
    console.log(`✓ Slug lookup verified: ${slugData.data.slug} -> ${slugData.data.titleFa}`);

    // Verify 404 on non-existent slug
    const invalidSlugRes = await fetch(`${baseUrl}/categories/non-existent-taxonomy-item`);
    const invalidSlugData = await invalidSlugRes.json();
    if (invalidSlugRes.status !== 404 || invalidSlugData.success) {
      throw new Error(`Expected 404 for invalid slug, received: ${invalidSlugRes.status}`);
    }
    console.log('✓ Correctly received 404 for non-existent category slug');

    // -------------------------------------------------------------
    // 4. Explore Discovery API
    // -------------------------------------------------------------
    console.log('\n[TEST 4] GET /api/v1/explore');
    const exploreRes = await fetch(`${baseUrl}/explore`);
    const exploreData = await exploreRes.json();
    if (!exploreRes.ok || !exploreData.success || !exploreData.data || !Array.isArray(exploreData.data.items)) {
      throw new Error(`Failed to fetch explore items: ${JSON.stringify(exploreData)}`);
    }
    console.log(`✓ Explore returned ${exploreData.data.items.length} items (total: ${exploreData.data.total})`);

    if (exploreData.data.items.length > 0) {
      const sampleItem = exploreData.data.items[0];
      if (!sampleItem.listing || !sampleItem.business) {
        throw new Error(`Explore item missing listing or business: ${JSON.stringify(sampleItem)}`);
      }
      console.log(`✓ Explore item contract verified: Listing "${sampleItem.listing.title}" by Business "${sampleItem.business.name}"`);
    }

    // Test text search filtering
    console.log('\n[TEST 4b] GET /api/v1/explore?search=نخ');
    const searchRes = await fetch(`${baseUrl}/explore?search=${encodeURIComponent('نخ')}`);
    const searchData = await searchRes.json();
    if (!searchRes.ok || !searchData.success) {
      throw new Error(`Failed to filter explore items by search: ${JSON.stringify(searchData)}`);
    }
    console.log(`✓ Search for 'نخ' returned ${searchData.data.items.length} matched items`);

    // Test city filtering
    console.log('\n[TEST 4c] GET /api/v1/explore?city=تهران');
    const cityRes = await fetch(`${baseUrl}/explore?city=${encodeURIComponent('تهران')}`);
    const cityData = await cityRes.json();
    if (!cityRes.ok || !cityData.success) {
      throw new Error(`Failed to filter explore items by city: ${JSON.stringify(cityData)}`);
    }
    console.log(`✓ City filter for 'تهران' returned ${cityData.data.items.length} items`);

    // -------------------------------------------------------------
    // 5. Locations API
    // -------------------------------------------------------------
    console.log('\n[TEST 5] GET /api/v1/locations/businesses');
    const locRes = await fetch(`${baseUrl}/locations/businesses`);
    const locData = await locRes.json();
    const businessList = Array.isArray(locData.data) ? locData.data : locData.data?.businesses;
    if (!locRes.ok || !locData.success || !Array.isArray(businessList)) {
      throw new Error(`Failed to fetch business locations: ${JSON.stringify(locData)}`);
    }
    console.log(`✓ Locations API returned ${businessList.length} businesses for map display`);

    if (businessList.length > 0) {
      const sampleLoc = businessList[0];
      if (typeof sampleLoc.latitude !== 'number' || typeof sampleLoc.longitude !== 'number') {
        throw new Error(`Business location item coordinates must be valid numbers: ${JSON.stringify(sampleLoc)}`);
      }
      console.log(`✓ Business pin verified: "${sampleLoc.name}" at (${sampleLoc.latitude}, ${sampleLoc.longitude}) in ${sampleLoc.city}`);
    }

    console.log('\n=====================================================');
    console.log('✅ ALL VERTICAL SLICE 03 TESTS PASSED PERFECTLY!');
    console.log('=====================================================');
  } finally {
    server.close();
  }
}

runVerticalSlice03Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  });
