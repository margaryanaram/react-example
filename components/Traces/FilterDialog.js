import React, { Component } from 'react'
import {Col, Icon, Select, Form, Button, Input, Radio, AutoComplete } from 'antd';
import ActiveFilters from '../../components/Traces/ActiveFilters';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class FilterDialog extends Component {

  render() {
    const {
      theme,
      filterDialog,
      toggleFilterDialog,
      handleFilterSubmit,
      getFieldDecorator,
      services,
      tags,
      handleFilterSearchChange,
      handleTagKeyChange,
      tagsFound,
      currentFilters,
      initiatorsFound,
      handleRemoveFilter
    } = this.props;
    return (
      <Col className={theme.filtersParent}>
        <div className={theme.filterContainer}>
          <Icon type="filter" onClick={() => toggleFilterDialog()}/>
          {
            filterDialog &&
            <div className={theme.filterDialog}>
              <p>Apply filters</p>
              <Form onSubmit={(e) => handleFilterSubmit(e)}>
                <FormItem
                  className={theme.filterInput}
                  label="Service"
                  labelCol={{span: 4}}
                >
                  {getFieldDecorator('services')(
                    <Select
                      mode="multiple"
                    >
                      {
                        services &&
                        services.map(service => <Option key={service}>{service}</Option>)
                      }
                    </Select>
                  )}
                </FormItem>
                <div className="byTimeParent">
                  <FormItem
                    label="Duration"
                    className={theme.byTimeContainer}
                  >
                    {getFieldDecorator('durationStatus', {
                      initialValue: 'gt'
                    })(
                      <RadioGroup>
                        <RadioButton value="gt">&gt;</RadioButton>
                        <RadioButton
                          value="ge">&ge;</RadioButton>
                        <RadioButton value="lt">&lt;</RadioButton>
                        <RadioButton
                          value="le">&le;</RadioButton>
                      </RadioGroup>
                    )}
                  </FormItem>
                  <FormItem
                    labelCol={{span: 4}}
                    className={theme.byTimeValue}
                  >
                    {getFieldDecorator('duration', {
                      rules: [{
                        pattern: /^\d+$/,
                        message: 'Please enter only numbers!'
                      }],
                    })(
                      <div className={theme.byTimeBlock}>
                        <Input placeholder="Any number in milliseconds"/>
                      </div>
                    )}
                  </FormItem>
                </div>
                <div className="byTimeParent">
                  <FormItem
                    label="Self-time"
                    className={theme.byTimeContainer}>
                    {getFieldDecorator('selfTimeStatus', {
                      initialValue: 'gt'
                    })(
                      <RadioGroup>
                        <RadioButton value="gt">&gt;</RadioButton>
                        <RadioButton
                          value="ge">&ge;</RadioButton>
                        <RadioButton value="lt">&lt;</RadioButton>
                        <RadioButton
                          value="le">&le;</RadioButton>
                      </RadioGroup>
                    )}
                  </FormItem>
                  <FormItem
                    labelCol={{span: 4}}
                    className={theme.byTimeValue}
                  >
                    {getFieldDecorator('selfTime', {
                      rules: [{
                        pattern: /^\d+$/,
                        message: 'Please enter only numbers!'
                      }],
                    })(
                      <div className={theme.byTimeBlock}>
                        <Input placeholder="Any number in milliseconds"/>
                      </div>
                    )}
                  </FormItem>
                </div>
                <FormItem
                  className={theme.filterInput}
                  label="Initiator"
                  labelCol={{span: 4}}
                >
                  {getFieldDecorator('initiators')(
                    <Select
                      mode="combobox"
                      onChange={(val) => handleFilterSearchChange(val, 'initiatorsFound')}
                    >
                      {
                        initiatorsFound &&
                        initiatorsFound.map(initiator => <Option
                          key={initiator}>{initiator}</Option>)
                      }
                    </Select>
                  )}
                </FormItem>
                <div className={theme.tagsContainer}>
                  <FormItem
                    className={theme.tagKey}
                    label="Tag name"
                  >
                    {getFieldDecorator('tagKey')(
                      <Select
                        mode="combobox"
                        placeholder="Choose tag name"
                        onChange={(val) => handleTagKeyChange()}
                      >
                        {
                          tags &&
                          tags.map(tag => <Option key={tag}>{tag}</Option>)
                        }
                      </Select>
                    )}
                  </FormItem>
                  <FormItem
                    className={theme.tagVal}
                  >
                    {getFieldDecorator('tagVal')(
                      <AutoComplete
                        dataSource={tagsFound}
                        onSearch={(val) => handleFilterSearchChange(val, 'tagsFound')}
                        placeholder="input here"
                      />
                    )}
                  </FormItem>
                </div>
                <FormItem>
                  <Button type="primary" htmlType="submit">Apply filters</Button>
                </FormItem>
              </Form>
            </div>
          }
        </div>
        {
          currentFilters &&
          <ActiveFilters theme={theme} currentFilters={currentFilters} handleRemoveFilter={handleRemoveFilter.bind(this)}  />
        }
      </Col>
    )
  }
}

export default FilterDialog;