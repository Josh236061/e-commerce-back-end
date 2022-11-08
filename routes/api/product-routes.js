
const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

router.get('/', async (req, res) => { // Finds all products and includes associated category and tag data
  try {
    const d = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ['category_name']
        },
        {
          model: Tag,
          attributes: ['tag_name']
        }
      ]
    })
    res.status(200).json(d);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get('/:id', async (req, res) => { // Finds a single product by its ID and includes associated category and tag data
  try {
    const d = await Product.findOne({
      where: {
        id: req.params.id
      },
      include: [
        {
          model: Category,
          attributes: ['category_name']
        },
        {
          model: Tag,
          attributes: ['tag_name']
        }
      ]
    })
    if (!d) {
      res.status(404).json({message: "Couldn't find that product ID!"});
    } else {
      res.status(200).json(d);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // If there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // If no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => { // Updates product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // Finds all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // Gets list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // Creates filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // Figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // Runs both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => { // delete one product by its `id` value
  try {
    const d = await Product.destroy({
      where: {
        id: req.params.id
      }
    })
    if (!d) {
      res.status(404).json({message: 'Could not find a product with that ID!'});
    } else {
      res.status(200).json(d);
    }
  } catch (error) {
    res.status(500).json(error);
  }
  
});

module.exports = router;
