/**
 * Sunny Tian
 * 2/28/24
 *
 * This is my script for the english 208 website.
 */

"use strict";
const pages = ["home", "jan", "feb", "march", "april", "may", "june", "july",
  "aug", "sep", "oct", "nov", "dec", "end"];

(function() {
  window.addEventListener("load", init);

  function init() {
    // let populateBtn = id("pop");
    // populateBtn.addEventListener("click", populate);
  }

  // async function populate() {
  //   try {
  //     let topSongs = await fetchTopSongs('1'); // manually change for each month
  //     showTopSongs(topSongs);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // function showTopSongs(data) {
  //   // manipulate dom
  //   console.log(data);
  // }

  // async function fetchTopSongs(month) {
  //   try {
  //     let response = await fetch(`/getTopSongs?month=${month}`);
  //     if (response.ok) {
  //       let topSongs = await response.json();
  //       return topSongs;
  //     }
  //   } catch (err) {
  //     return err;
  //   }
  // }

  /**
   * Returns a new node element according to the given tag name.
   * @param {string} tag -
   * @return {Node} -
   */
  function gen(tag) {
    return document.createElement(tag);
  }

  /**
   * This function returns the node with the given id.
   * @param {string} id - the name of the id for the node to return.
   * @return {Node} the node with the given id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * This function returns the node with the given selector. If there are
   * multiple nodes with the same selector, returns the first.
   * @param {string} selector - the name of the selector for the node to return.
   * @return {Node} the node with the given selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * This function returns a list of nodes with the given selector. If there is
   * one node with the given selector, returns a list with one node.
   * @param {string} selector - the given selector to match nodes to.
   * @returns {NodeList} the nodes with the given selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();