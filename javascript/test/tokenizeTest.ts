import assert from 'assert'
import { isSetIterator } from 'util/types'

import { Token, TokenType } from '../src/Ast.js'

const tokenize: (input: string) => Token[] = (input) => {
  const tokens: Array<Token> = []

  //  "hello world" --> 3 tokens
  //  "hello  world"  --> 4 tokens
  //       ^
  // firstIndex
  // curentType

  let startOfWord = -1
  let currentIndex = 0
  let tokenType: TokenType | undefined = undefined
  let previousTokenType: TokenType | undefined

  for (currentIndex; currentIndex < input.length; currentIndex++) {
    previousTokenType = tokenType
    if (input[currentIndex] === ' ') {
      tokenType = TokenType.whiteSpace
    } else {
      tokenType = TokenType.text
    }

    // moving into a string?
    if (previousTokenType !== TokenType.text && tokenType === TokenType.text) {
      startOfWord = currentIndex
    }

    // moving out of a string?
    //
    // ' '
    //  ^
    // if (
    //   previousTokenType !== undefined &&
    //   previousTokenType !== tokenType &&
    //   tokenType !== TokenType.text
    // ) {
    //   const subString = input.slice(startOfWord, currentIndex)
    //   tokens.push(
    //     new Token(
    //       previousTokenType,
    //       subString,
    //       startOfWord,
    //       startOfWord + subString.length
    //     )
    //   )
    // }

    if (tokenType !== TokenType.text) {
      tokens.push(new Token(tokenType, input[currentIndex], currentIndex, currentIndex + 1))
    }
  }

  //  "hello world" --> 3 tokens
  //  "hello"  --> 4 tokens
  //       ^

  currentIndex++
  if (tokenType === TokenType.text) {
    const subString = input.slice(startOfWord, currentIndex)
    tokens.push(new Token(tokenType, subString, startOfWord, startOfWord + subString.length))
  }

  return tokens
}

describe(tokenize.name, () => {
  it.only('empty string', () => {
    const result = tokenize('')
    assert.deepEqual(result, [])
  })

  it.only('single-character word', () => {
    const result = tokenize('a')
    assert.deepEqual(result, [new Token(TokenType.text, 'a', 0, 1)])
  })

  it.only('two-character word', () => {
    const result = tokenize('ab')
    assert.deepEqual(result, [new Token(TokenType.text, 'ab', 0, 2)])
  })

  it.only('a space', () => {
    const result = tokenize(' ')
    assert.deepEqual(result, [new Token(TokenType.whiteSpace, ' ', 0, 1)])
  })

  it('two consecutive spaces', () => {
    const result = tokenize('  ')
    assert.deepEqual(result, [
      new Token(TokenType.whiteSpace, ' ', 0, 1),
      new Token(TokenType.whiteSpace, ' ', 1, 2),
    ])
  })

  it('a single-character word followed by a space', () => {
    const result = tokenize('a ')
    assert.deepEqual(result, [
      new Token(TokenType.text, 'a', 0, 1),
      new Token(TokenType.whiteSpace, ' ', 1, 2),
    ])
  })

  it('a space followed by a single-character word', () => {
    const result = tokenize(' b')
    assert.deepEqual(result, [
      new Token(TokenType.whiteSpace, ' ', 0, 1),
      new Token(TokenType.text, 'b', 1, 2),
    ])
  })

  it('a word', () => {
    const result = tokenize('abc')
    assert.deepEqual(result, [new Token(TokenType.text, 'abc', 0, 3)])
  })

  it('a word followed by a space', () => {
    const result = tokenize('ab ')
    assert.deepEqual(result, [
      new Token(TokenType.text, 'ab', 0, 2),
      new Token(TokenType.whiteSpace, ' ', 2, 3),
    ])
  })

  it('word - space - word', () => {
    const result = tokenize('a c')
    assert.deepEqual(result, [
      new Token(TokenType.text, 'a', 0, 1),
      new Token(TokenType.whiteSpace, ' ', 1, 2),
      new Token(TokenType.text, 'c', 2, 3),
    ])
  })

  it('space - word', () => {
    const result = tokenize(' bc')
    assert.deepEqual(result, [
      new Token(TokenType.whiteSpace, ' ', 0, 1),
      new Token(TokenType.text, 'bc', 1, 3),
    ])
  })

  it('handles a string with unnicode / emojis in it')
})
