// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { render } from '@testing-library/react';
import FormField, { FormFieldProps } from '../../../lib/components/form-field';
import createWrapper, { FormFieldWrapper } from '../../../lib/components/test-utils/dom';

function renderFormField(props: FormFieldProps = {}) {
  const renderResult = render(<FormField {...props} />);
  return createWrapper(renderResult.container).findFormField()!;
}

describe('FormField component', () => {
  describe('Basic rendering', () => {
    [
      { slot: 'label', finder: (wrapper: FormFieldWrapper) => wrapper.findLabel() },
      { slot: 'description', finder: (wrapper: FormFieldWrapper) => wrapper.findDescription() },
      { slot: 'info', finder: (wrapper: FormFieldWrapper) => wrapper.findInfo() },
      { slot: 'constraintText', finder: (wrapper: FormFieldWrapper) => wrapper.findConstraint() },
      { slot: 'errorText', finder: (wrapper: FormFieldWrapper) => wrapper.findError() },
      { slot: 'children', finder: (wrapper: FormFieldWrapper) => wrapper.findControl() },
      { slot: 'secondaryControl', finder: (wrapper: FormFieldWrapper) => wrapper.findSecondaryControl() },
    ].forEach(({ slot, finder }) => {
      describe(`${slot}`, () => {
        test(`displays empty ${slot} when not set`, () => {
          const wrapper = renderFormField({});
          expect(finder(wrapper)).toBeNull();
        });

        test(`displays empty ${slot} when set to empty`, () => {
          const props: any = {};
          props[slot] = '';
          const wrapper = renderFormField(props);
          expect(finder(wrapper)).toBeNull();
        });

        test(`renders a ${slot} when a string is passed`, () => {
          const value = 'this is a string';
          const props: any = {};
          props[slot] = value;

          const wrapper = renderFormField(props);
          expect(finder(wrapper)?.getElement()).toHaveTextContent(value);
        });

        test(`renders a ${slot} when jsx is passed`, () => {
          const value = (
            <div>
              this is a <strong>formatted</strong> value
            </div>
          );
          const props: any = {};
          props[slot] = value;
          const wrapper = renderFormField(props);

          expect(finder(wrapper)?.getElement()).toHaveTextContent('this is a formatted value');
          expect(finder(wrapper)?.getElement().innerHTML).toEqual(
            '<div>this is a <strong>formatted</strong> value</div>'
          );
        });

        test(`${slot} re-renders content correctly`, () => {
          let wrapper: FormFieldWrapper;

          const renderResult = render(<FormField />);
          wrapper = createWrapper(renderResult.container).findFormField()!;
          expect(finder(wrapper)).toBeNull();

          const value = 'this is a string';
          const props: any = {};
          props[slot] = value;

          renderResult.rerender(<FormField {...props} />);
          wrapper = createWrapper(renderResult.container).findFormField()!;
          expect(finder(wrapper)?.getElement()).not.toBeNull();
        });
      });
    });
  });

  test('label is rendered with semantic DOM element', () => {
    const testLabel = 'Label Unit Test';

    const wrapper = renderFormField({
      label: testLabel,
    });

    const labelElement = wrapper.findLabel();
    expect(labelElement).not.toBeNull();
    expect(labelElement?.getElement()).toHaveTextContent(testLabel);
    expect(labelElement?.getElement().tagName).toBe('LABEL');
  });

  test('constraintText region displays constraint content text when error-text is also set', () => {
    const constraintText = 'let this be a lesson to you';
    const errorText = 'wrong, do it again';
    const wrapper = renderFormField({
      constraintText,
      errorText,
    });
    expect(wrapper.findConstraint()?.getElement()).toHaveTextContent(constraintText);
    expect(wrapper.findError()?.getElement()).toHaveTextContent(errorText);
  });
});
