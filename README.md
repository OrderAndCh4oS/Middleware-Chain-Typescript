# Validation Chain

Clone repo and run
`npm install`

Build
```sh
npm run build
```

Run
```sh
npm run script
```

Watch for changes (will need to run `npm run script` manually still)
```sh
npm run watch
```

## Example

*Define Schema*
```typescript
const validateObj: IValidateParams = {
    aString: {
        required: true,
        isType: 'string'
    },
    aStringTwo: {
        required: true,
        isType: 'string'
    },
    aStringThree: {
        required: true,
        isType: 'string',
        minLength: 3,
        maxLength: 5,
    },
    aStringFour: {
        required: false,
        isType: 'string'
    },
    aNumber: {
        required: true,
        isType: 'number',
        minValue: 10,
        maxValue: 100
    },
}
```

*Example with some errors*
```typescript
const invalidObj: any = {
    aStringTwo: 14214,
    aStringThree: 'asfasfsasaf',
    aStringFour: 'asfas',
    aNumber: 12345
}

// Chaining the validators using `.add()` fluent method.
let someErrors = validationChain()
    .add(required)
    .add(isType)
    .add(minValue)
    .add(maxValue)
    .add(minLength)
    .add(maxLength)
    .validate(invalidObj, validateObj);

console.log('some errors', someErrors);
```

*Example with no errors*
```typescript
const validObj: any = {
    aString: 'asfasf',
    aStringTwo: '1421asasf4',
    aStringThree: 'asfas',
    aNumber: 80
}

// Chaining the validators by passing them in as parameters.
let noErrors = validationChain(required, isType, minValue, maxValue, minLength, maxLength)
    .validate(validObj, validateObj);

console.log('no errors: ', noErrors);
```
