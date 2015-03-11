/** @jsx createElement */
import _ from 'lodash'
import {createElement} from 'lacona-phrase'
import {Phrase} from 'lacona-phrase'

function addSeparator (child, separator) {
  if (child.props.optional) {
    newChild = _.clone(child)
    newChild.props = _.clone(child.props)
    newChild.props.optional = false
    return <Sequence optional={true}>{newChild}{separator}</Sequence>
  } else {
    return <Sequence>{child}{separator}</Sequence>
  }
}

export default class Sequence extends Phrase {
  describe() {
    let content, separator
    if (this.props.children.length > 0 && this.props.children[0].Constructor === 'content') {
      content = this.props.children[0].children
      if (this.props.children.length > 1 && this.props.children[1].Constructor === 'separator') {
        separator = this.props.children[1].children[0]
      }
    } else {
      return //no content, we're good to go!
    }

    if (separator) {
      return (
        <sequence {...this.props}>
          {_.chain(content.slice(0, -1))
            .map(_.partial(addSeparator, _, separator))
            .concat(_.last(content))
            .value()
          }
        </sequence>
      )
    } else {
      return <sequence {...this.props}>{content}</sequence>
    }
  }

  *_handleParse(input, options, parse) {
    const self = this

    function *parseChild (childIndex, input) {
      for (let output of parse(self.props.children[childIndex], input, options)) {
        if (childIndex === self.props.children.length - 1) {
           yield output.update('result', result => result.set(self.props.id, self.props.value))
        } else {
          yield* parseChild(childIndex + 1, output)
        }
      }
    }

    yield* parseChild(0, input)
  }
}
