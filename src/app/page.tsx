'use client'

import { trpc } from '@/components/providers/trpc-provider'

export default function Home() {
  const { data: ingredients, isLoading } = trpc.ingredients.list.useQuery()
  const { data: suppliers } = trpc.suppliers.list.useQuery()
  const { data: locations } = trpc.locations.list.useQuery()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bartender Inventory System
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive inventory management for bars - No authentication required!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Ingredients Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
            {isLoading ? (
              <p className="text-gray-500">Loading ingredients...</p>
            ) : (
              <div>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {ingredients?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Total ingredients in system</p>
                {ingredients && ingredients.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {ingredients.slice(0, 3).map((ingredient: any) => (
                        <li key={ingredient.id} className="flex justify-between">
                          <span>{ingredient.name}</span>
                          <span className="text-green-600">${ingredient.current_price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Suppliers Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Suppliers</h2>
            <div>
              <p className="text-3xl font-bold text-green-600 mb-2">
                {suppliers?.length || 0}
              </p>
              <p className="text-sm text-gray-500">Active suppliers</p>
              {suppliers && suppliers.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Suppliers:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {suppliers.slice(0, 3).map((supplier: any) => (
                      <li key={supplier.id} className="flex justify-between">
                        <span>{supplier.name}</span>
                        <span className="text-blue-600">{supplier._count.ingredients} items</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Locations Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Locations</h2>
            <div>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {locations?.length || 0}
              </p>
              <p className="text-sm text-gray-500">Storage locations</p>
              {locations && locations.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Locations:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {locations.map((location: any) => (
                      <li key={location.id} className="flex justify-between">
                        <span className="capitalize">{location.name}</span>
                        <span className="text-purple-600">{location._count.snapshots} records</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Database Connected</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">tRPC API Active</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">No Authentication Required</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Ready for Development</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Your bartender inventory system is ready! All API endpoints are accessible without authentication.
          </p>
          <div className="space-x-4">
            <a href="/ingredients" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block">
              View Ingredients
            </a>
            <a href="/suppliers" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block">
              Manage Suppliers
            </a>
            <a href="/inventory" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block">
              Track Inventory
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}