/**
 * @jest-environment jsdom
 */
import React from "react";
import { shallow } from "enzyme";
import { Users } from "../../../src/client/Components/Users";

jest.mock("../../../src/client/hooks/useUsers");

const useUsers =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("../../../src/client/hooks/useUsers").default;

describe("Users", () => {
  describe("when users are loading", () => {
    beforeEach(() => {
      useUsers.mockReturnValue({ isLoading: true });
    });

    it('renders "Loading"', () => {
      const component = shallow(<Users />);
      expect(component.text()).toBe("LOADING");
    });
  });

  describe("with test users", () => {
    const data = [
      {
        id: 1,
        username: "Bob",
        description: "journalist",
        created_at: "2021-04-01",
      },
      {
        id: 2,
        username: "Terry",
        description: "public",
        created_at: "2021-04-02",
      },
    ];

    beforeEach(() => {
      useUsers.mockReturnValue({ isLoading: false, data });
    });

    it("renders each user", () => {
      const component = shallow(<Users />);
      data.forEach(({ username, description, created_at }) => {
        expect(component.text()).toContain(
          `${username}: ${description} (${created_at})`
        );
      });
    });
  });
});
