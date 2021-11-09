/**
 * @jest-environment jsdom
 */
import React from "react";
import { shallow } from "enzyme";
import { Header } from "../../../src/client/Components/Header";

describe("Header", () => {
  it("renders with the name of the app", () => {
    const component = shallow(<Header />);
    expect(component.text()).toContain("News Labs I/O");
  });
});
