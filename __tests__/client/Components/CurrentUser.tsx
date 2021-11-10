/**
 * @jest-environment jsdom
 */
import React from "react";
import { shallow } from "enzyme";
import CurrentUser from "../../../src/client/Components/CurrentUser";

jest.mock("../../../src/client/hooks/useAuthenticatedUser");

const useAuthenticatedUser =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("../../../src/client/hooks/useAuthenticatedUser").default;

describe("CurrentUser", () => {
  it("renders with nothing if the user is still loading", () => {
    useAuthenticatedUser.mockReturnValueOnce({ isLoading: true });
    const component = shallow(<CurrentUser />);
    expect(component.text()).toBe("");
  });

  it("renders with nothing if the user is undefined", () => {
    useAuthenticatedUser.mockReturnValueOnce({ isLoading: false });
    const component = shallow(<CurrentUser />);
    expect(component.text()).toBe("");
  });

  it("renders with 'Anonymous user' if the user is anonymous", () => {
    useAuthenticatedUser.mockReturnValueOnce({
      isLoading: false,
      data: { isAnonymous: true },
    });
    const component = shallow(<CurrentUser />);
    expect(component.text()).toBe("Anonymous user");
  });

  it("renders username if the user is not anonymous", () => {
    useAuthenticatedUser.mockReturnValueOnce({
      isLoading: false,
      data: { isAnonymous: false, username: "Jo Example" },
    });
    const component = shallow(<CurrentUser />);
    expect(component.text()).toBe("Jo Example");
  });
});
