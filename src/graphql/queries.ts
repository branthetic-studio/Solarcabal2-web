import { gql } from "@apollo/client";

export const GET_TOP_LEVEL_COLLECTIONS = gql`
  query GetTopLevelCollections {
    collections(options: { topLevelOnly: true }) {
      items {
        id
        slug
        name
        featuredAsset {
          id
          preview
        }
      }
    }
  }
`;

export const GET_COLLECTION_PRODUCTS = gql`
  query GetCollectionProducts(
    $collectionSlug: String!
    $groupByProduct: Boolean = true
    $skip: Int = 0
    $take: Int = 20
    $facetValueIds: [ID!]
  ) {
    search(
      input: {
        collectionSlug: $collectionSlug
        groupByProduct: $groupByProduct
        skip: $skip
        take: $take
        facetValueIds: $facetValueIds
      }
    ) {
      totalItems
      items {
        productName
        slug
        productVariantId
        productVariantName
        facetValueIds
        productAsset {
          id
          preview
        }
        priceWithTax {
          __typename
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
        currencyCode
      }
    }
  }
`;

export const GET_PRODUCT_DETAILS = gql`
  query GetProductDetail($slug: String!) {
    product(slug: $slug) {
      id
      name
      description
      collections {
        name
        id
        slug
      }
      customFields {
        powerOutput
        efficiency
        voltage
        dimensions
        weight
        frameMaterial
        surfaceMaterial
        relatedProducts {
          variants {
            id
            name
            featuredAsset {
              preview
            }
            price
            product {
              id
              name
              slug
              enabled
              assets {
                preview
              }
              featuredAsset {
                id
                preview
              }
            }
            price
          }
        }
      }
      featuredAsset {
        id
        preview
      }
      assets {
        id
        preview
      }
      variants {
        id
        name
        sku
        stockLevel
        currencyCode
        price
        priceWithTax
        featuredAsset {
          id
          preview
        }
        assets {
          id
          preview
        }
      }
    }
  }
`;

/* ------------------- Fragments ------------------- */
export const ACTIVE_ORDER_FRAGMENT = gql`
  fragment ActiveOrder on Order {
    id
    code
    state
    currencyCode
    totalWithTax
    subTotalWithTax
    shippingWithTax
    lines {
      id
      quantity
      linePriceWithTax
      productVariant {
        id
        name
        sku
        product {
          id
          featuredAsset {
            id
            preview
          }
        }
      }
    }
    shippingLines {
      priceWithTax
      shippingMethod {
        id
        code
        name
        description
      }
    }
    customer {
      id
      firstName
      lastName
      emailAddress
    }
  }
`;

/* ------------------- Active order & orders ------------------- */
export const GET_ACTIVE_ORDER = gql`
  query GetActiveOrder {
    activeOrder {
      ...ActiveOrder
    }
  }
  ${ACTIVE_ORDER_FRAGMENT}
`;

export const GET_CUSTOMER_ORDERS = gql`
  query GetCustomerOrders($options: OrderListOptions) {
    orders(options: $options) {
      totalItems
      items {
        id
        code
        state
        totalWithTax
        createdAt
      }
    }
  }
`;

/* ------------------- Address & Shipping ------------------- */
export const SET_SHIPPING_ADDRESS = gql`
  mutation SetOrderShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      ...ActiveOrder
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${ACTIVE_ORDER_FRAGMENT}
`;

export const GET_SHIPPING_METHODS = gql`
  query GetShippingMethods {
    eligibleShippingMethods {
      id
      price
      description
      name
    }
  }
`;

export const SET_SHIPPING_METHOD = gql`
  mutation SetShippingMethod($id: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $id) {
      ...ActiveOrder
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${ACTIVE_ORDER_FRAGMENT}
`;

/* ------------------- Payments ------------------- */
export const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods {
    eligiblePaymentMethods {
      id
      name
      code
      isEligible
    }
  }
`;

export const TRANSITION_TO_STATE = gql`
  mutation TransitionToState($state: String!) {
    transitionOrderToState(state: $state) {
      ...ActiveOrder
      ... on OrderStateTransitionError {
        errorCode
        message
        transitionError
        fromState
        toState
      }
    }
  }
  ${ACTIVE_ORDER_FRAGMENT}
`;

/** Custom resolver on your backend */
export const PAYSTACK_INTENT = gql`
  mutation CreatePaystackIntent($orderCode: String!) {
    createPaystackPaymentIntent(orderCode: $orderCode) {
      authorizationUrl
      accessCode
      reference
      amount
    }
  }
`;

/** Custom resolver to restore cart when payment fails/cancels */
export const RECREATE_FAILED_ORDER = gql`
  mutation RecreateFailedOrder($orderCode: String!) {
    recreateFailedOrder(orderCode: $orderCode) {
      ...ActiveOrder
    }
  }
  ${ACTIVE_ORDER_FRAGMENT}
`;

/* ------------CART------------------ */
export const ADD_TO_CART = gql`
  mutation AddItemToOrder($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      ...ActiveOrder
      ... on ErrorResult {
        errorCode
        message
      }
      ... on InsufficientStockError {
        quantityAvailable
        order {
          ...ActiveOrder
        }
      }
    }
  }
  ${ACTIVE_ORDER_FRAGMENT}
`;

export const ADJUST_QUANTITY = gql`
  mutation AdjustOrderLine($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      ...ActiveOrder
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${ACTIVE_ORDER_FRAGMENT}
`;

export const GET_PRODUCTS_FOR_GRID = gql`
  query GetProductsForGrid($take: Int!, $skip: Int!) {
    products(options: { take: $take, skip: $skip }) {
      items {
        id
        name
        slug
        featuredAsset {
          preview
        }
        variants {
          id
          name
          priceWithTax
          stockLevel
          featuredAsset {
            preview
          }
        }
      }
      totalItems
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    activeCustomer {
      id
      emailAddress
      firstName
      lastName
    }
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!, $rememberMe: Boolean) {
    login(username: $username, password: $password, rememberMe: $rememberMe) {
      __typename
      ... on CurrentUser {
        id
        identifier
      }
      ... on InvalidCredentialsError {
        errorCode
        message
      }
      ... on NotVerifiedError {
        errorCode
        message
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

export const REGISTER_CUSTOMER = gql`
  mutation RegisterCustomer(
    $emailAddress: String!
    $password: String!
    $firstName: String
    $lastName: String
  ) {
    registerCustomerAccount(
      input: {
        emailAddress: $emailAddress
        password: $password
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      __typename
      ... on Success {
        success
      }
      ... on MissingPasswordError {
        message
      }
      ... on NativeAuthStrategyError {
        message
      }
    }
  }
`;

export const GET_ALL_FACETS = gql`
  query GetFacets {
    facets {
      items {
        values {
          id
          name
          facetId
          facet {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_CATEGORIES_QUERY = gql`
  query GetTopLevelCollections {
    collections(options: { topLevelOnly: true }) {
      items {
        id
        slug
        name
        featuredAsset {
          id
          preview
        }
      }
    }
  }
`;

/* ------------------- 🔍 Search Products ------------------- */
export const SEARCH_PRODUCTS = gql`
  query SearchProducts($input: SearchInput!) {
    search(input: $input) {
      totalItems
      items {
        productName
        slug
        productVariantId
        description
        productAsset {
          id
          preview
        }
        productVariantName
        inStock
        priceWithTax {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
      }
    }
  }
`;

const MY_REFERRAL_EARNING = gql`
  query MyReferralEarnings {
    myReferralEarningsDetails {
      id
      amount
      level
      orderCode
      status
      createdAt
    }
  }
`;


/** Ask server to send a reset email */
export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($emailAddress: String!) {
    requestPasswordReset(emailAddress: $emailAddress) {
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

/** Complete the reset with the token from email */
export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const VERIFY_EMAIL_ADDRESS_MUTATION = gql`
  mutation VerifyCustomerAccount($token: String!) {
    verifyCustomerAccount(token: $token) {
      __typename
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const REFRESH_CUSTOMER_VERIFICATION = gql`
  mutation RefreshCustomerVerification($emailAddress: String!) {
    refreshCustomerVerification(emailAddress: $emailAddress) {
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

/** Delete the current user’s account */
export const DELETE_MY_ACCOUNT = gql`
  mutation DeleteMyAccount {
    deleteMyAccount {
      ... on Success {
        success
        message
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveOrderLine($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      ...ActiveOrder
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${ACTIVE_ORDER_FRAGMENT}
`;

export const GET_ACCOUNT_DETAILS = gql`
  query GetAccountDetails {
    activeCustomer {
      id
      title
      firstName
      lastName
      emailAddress
      addresses {
        id
        fullName
        company
        streetLine1
        streetLine2
        city
        province
        postalCode
        phoneNumber
        defaultShippingAddress
        defaultBillingAddress
        country {
          code
          name
        }
      }
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      id
      title
      firstName
      lastName
      emailAddress
    }
  }
`;

export const CREATE_CUSTOMER_ADDRESS = gql`
  mutation CreateCustomerAddress($input: CreateAddressInput!) {
    createCustomerAddress(input: $input) {
      id
      fullName
      company
      streetLine1
      streetLine2
      city
      province
      postalCode
      phoneNumber
      defaultShippingAddress
      defaultBillingAddress
      country {
        code
        name
      }
    }
  }
`;

export const UPDATE_CUSTOMER_ADDRESS = gql`
  mutation UpdateCustomerAddress($input: UpdateAddressInput!) {
    updateCustomerAddress(input: $input) {
      id
      fullName
      company
      streetLine1
      streetLine2
      city
      province
      postalCode
      phoneNumber
      defaultShippingAddress
      defaultBillingAddress
      country {
        code
        name
      }
    }
  }
`;

export const DELETE_CUSTOMER_ADDRESS = gql`
  mutation DeleteCustomerAddress($id: ID!) {
    deleteCustomerAddress(id: $id) {
      success
      message
    }
  }
`;

export const GET_CUSTOMER_ADDRESSES = gql`
  query GetCustomerAddresses {
    activeCustomer {
      id
      addresses {
        id
        fullName
        phoneNumber
        streetLine1
        streetLine2
        city
        province
        postalCode
        defaultShippingAddress
        country {
          code
        }
      }
    }
  }
`;

export const GET_CATEGORIES_BY_FACET = gql`
  query GetCategoriesByFacet($facetValues: FacetValueFilterInput!) {
    search(
      input: {
        facetValueFilters: [$facetValues]
        groupByProduct: true
        take: 0
      }
    ) {
      collections {
        collection {
          id
          name
          slug
          featuredAsset {
            id
            preview
          }
        }
      }
    }
  }
`;

export const SEARCH_PACKAGES = gql`
  query SearchPackages($input: SearchInput!) {
    search(input: $input) {
      totalItems
      facetValues {
        count
        facetValue {
          id
          name
          facet {
            id
            name
          }
        }
      }
      collections {
        collection {
          id
          name
          slug
          productVariants {
            items {
              id
              name
              priceWithTax
              product {
                slug
              }
              featuredAsset {
                id
                preview
              }
              customFields {
                packageCapacity
                packageComponents {
                  id
                  name
                  slug
                  featuredAsset {
                    id
                    preview
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;