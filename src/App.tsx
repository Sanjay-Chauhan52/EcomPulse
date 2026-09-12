import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import Overview from "@/pages/Overview"
import Customer360 from "@/pages/Customer360"
import PurchaseFriction from "@/pages/PurchaseFriction"
import RelationshipRisk from "@/pages/RelationshipRisk"
import CustomerValue from "@/pages/CustomerValue"
import BehaviouralDNA from "@/pages/BehaviouralDNA"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/customer-360" element={<Customer360 />} />
          <Route path="/purchase-friction" element={<PurchaseFriction />} />
          <Route path="/relationship-risk" element={<RelationshipRisk />} />
          <Route path="/customer-value" element={<CustomerValue />} />
          <Route path="/behavioural-dna" element={<BehaviouralDNA />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
