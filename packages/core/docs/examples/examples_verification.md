---
title: Examples - Page Verification
---

# Examples - Page Verification

## Overview

When load testing an application, it's very important to verify the page at each step of the test.
This verification acts not only as a way to ensure you are in the correct part of the application under test, 
but also serves to anchor test timings to allow Element to correctly calculate and aggregate metrics such as the step response time.

If you don't verify the state of the app, then you're only timing the action of clicking on a link or button -- that is, the performance of the javascript running on the page.
Adding verification allows your test to take into account both the javascript performance, *and* the page load and display times.

## Contents

1. [Page Verification - By Text](examples_verification_bytext.md)
2. [Page Verification - By Object Properties](examples_verification_byobject.md)

<!-- suffix -->
